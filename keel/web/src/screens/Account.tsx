import { useEffect, useState } from "preact/hooks";
import { AuthError, requestEmailOtp, verifyEmailOtp, freshSession, disableReminders, enableReminders, getReminderPrefs, pushSupported, type ReminderPrefs } from "../backend.ts";
import { BACKEND, BACKEND_CONFIGURED } from "../config.ts";
import type { Ctx } from "../app.tsx";
import type { Strings } from "../i18n.ts";

// "Back up and sync" (B3/B4) + "Reminders" (B5) + "Delete my account" (B7).
// Anonymous local use keeps working; nothing here is required (CLAUDE.md B3).
export function SignIn(p: { t: Strings; onSignedIn: () => Promise<void>; compact?: boolean }) {
  const { t } = p;
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const send = async () => {
    setBusy(true); setErr(null);
    try { await requestEmailOtp(email.trim()); setSent(true); }
    catch (e) { setErr(e instanceof AuthError ? `${t.signInFail} ${e.message}` : t.offlineHint); }
    finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setErr(null);
    try { await verifyEmailOtp(email.trim(), code.trim()); await p.onSignedIn(); }
    catch (e) { setErr(e instanceof AuthError ? t.codeFail : t.offlineHint); }
    finally { setBusy(false); }
  };
  return (
    <div class="signin" data-signin>
      {!p.compact && <p class="muted">{t.syncHint}</p>}
      <label>{t.email}<input type="email" inputMode="email" autocomplete="email" name="email" value={email} disabled={sent} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} /></label>
      {!sent
        ? <button class="secondary" data-action="send-code" disabled={busy || !/^\S+@\S+\.\S+$/.test(email.trim())} onClick={send}>{t.sendCode}</button>
        : <>
          <label>{t.codeLabel}<input inputMode="numeric" autocomplete="one-time-code" name="code" value={code} onInput={(e) => setCode((e.target as HTMLInputElement).value)} /></label>
          <button class="primary" data-action="verify-code" disabled={busy || code.trim().length < 6} onClick={verify}>{t.verify}</button>
          <button class="link" onClick={() => { setSent(false); setCode(""); }}>{t.back}</button>
        </>}
      {err && <p class="notice" role="alert">{err}</p>}
    </div>
  );
}

function fmtTime(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function AccountSection(p: { ctx: Ctx }) {
  const { ctx } = p;
  const { t } = ctx;
  const [prefs, setPrefs] = useState<ReminderPrefs | null>(null);
  const [sendAt, setSendAt] = useState("20:00");
  const [quiet, setQuiet] = useState<[string, string]>(["22:00", "07:00"]);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const signedIn = ctx.session != null;

  useEffect(() => {
    if (!signedIn || !pushSupported()) return;
    getReminderPrefs().then((r) => { if (r) { setPrefs(r); setSendAt(r.send_at); setQuiet([r.quiet_start, r.quiet_end]); } }).catch(() => {});
  }, [signedIn]);

  if (!BACKEND_CONFIGURED && !BACKEND.url.startsWith("http://127.0.0.1") && !BACKEND.url.startsWith("http://localhost")) {
    return <><h3>{t.backupSync}</h3><p class="muted">{t.syncSoon}</p></>;
  }

  const status = ctx.sync;
  const statusLine = status.status === "reauth" ? t.syncReauth
    : status.status === "offline" ? t.syncOffline
    : status.status === "error" ? `${t.syncError} ${status.error ?? ""}`
    : status.status === "syncing" ? t.syncing
    : `${t.lastSynced} ${fmtTime(status.last_sync_at, ctx.locale)}`;

  const toggleReminders = async () => {
    setBusy(true); setNote(null);
    try {
      if (prefs?.push) { await disableReminders(); setPrefs({ ...(prefs ?? { push: false, send_at: sendAt, quiet_start: quiet[0], quiet_end: quiet[1], adaptive: false }), push: false }); }
      else {
        const ok = await enableReminders({ send_at: sendAt, quiet_start: quiet[0], quiet_end: quiet[1], adaptive: false });
        if (!ok) setNote(t.pushDenied); else setPrefs({ push: true, send_at: sendAt, quiet_start: quiet[0], quiet_end: quiet[1], adaptive: false });
      }
    } catch { setNote(t.offlineHint); }
    finally { setBusy(false); }
  };

  const deleteAccount = async () => {
    if (!confirm(t.deleteAccountConfirm)) return;
    setBusy(true);
    try {
      const s = await freshSession();
      if (!s) throw new Error("signed out");
      const r = await fetch(`${BACKEND.url}/functions/v1/delete-account`, { method: "POST", headers: { apikey: BACKEND.anonKey, Authorization: `Bearer ${s.access_token}`, "Content-Type": "application/json" }, body: "{}" });
      if (!r.ok) throw new Error(String(r.status));
      await ctx.signOutAll(true);
    } catch { setNote(t.offlineHint); }
    finally { setBusy(false); }
  };

  return (
    <>
      <h3>{t.backupSync}</h3>
      {!signedIn ? <SignIn t={t} onSignedIn={ctx.onSignedIn} /> : (
        <div class="account" data-account>
          <p class="muted">{ctx.session?.user.email ?? ctx.session?.user.phone}</p>
          <p class="muted sync-status" data-sync-status={status.status}>{statusLine}</p>
          {status.status === "reauth" && <SignIn t={t} onSignedIn={ctx.onSignedIn} compact />}
          <button class="secondary" data-action="sync-now" disabled={status.status === "syncing"} onClick={() => ctx.syncNow()}>{t.syncNow}</button>
          <button class="secondary" data-action="sign-out" onClick={() => ctx.signOutAll(false)}>{t.signOut}</button>

          <h3>{t.reminders}</h3>
          {!pushSupported() ? <p class="muted">{t.pushUnsupported}</p> : (
            <>
              <p class="muted">{t.remindersHint}</p>
              <label>{t.remindAt}<input type="time" value={sendAt} disabled={prefs?.push} onInput={(e) => setSendAt((e.target as HTMLInputElement).value)} /></label>
              <div class="quiet">
                <label>{t.quietFrom}<input type="time" value={quiet[0]} disabled={prefs?.push} onInput={(e) => setQuiet([(e.target as HTMLInputElement).value, quiet[1]])} /></label>
                <label>{t.quietTo}<input type="time" value={quiet[1]} disabled={prefs?.push} onInput={(e) => setQuiet([quiet[0], (e.target as HTMLInputElement).value])} /></label>
              </div>
              <button class={prefs?.push ? "secondary" : "primary"} data-action="toggle-reminders" disabled={busy} onClick={toggleReminders}>{prefs?.push ? t.remindersOff : t.remindersOn}</button>
            </>
          )}
          <button class="secondary danger" data-action="delete-account" disabled={busy} onClick={deleteAccount}>{t.deleteAccount}</button>
        </div>
      )}
      {note && <p class="notice" role="status">{note}</p>}
    </>
  );
}
