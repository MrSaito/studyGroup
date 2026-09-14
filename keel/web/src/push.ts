// Web Push client side (B5). Opt-in from Settings only, after the value line.
// The VAPID public key is public; the private half lives in Supabase Vault.
import { BACKEND } from "./config.ts";
import { freshSession } from "./auth.ts";
import { restApi } from "./sync.ts";

export function pushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !BACKEND.vapidPublicKey.startsWith("__");
}

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const s = (b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(s);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export interface ReminderPrefs { push: boolean; send_at: string; quiet_start: string; quiet_end: string; adaptive: boolean }

/** Asks permission, subscribes, and records subscription + prefs on the server. Returns false if permission was refused. */
export async function enableReminders(prefs: Omit<ReminderPrefs, "push">): Promise<boolean> {
  const session = await freshSession();
  if (!session) throw new Error("signed out");
  if ((await Notification.requestPermission()) !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(BACKEND.vapidPublicKey) }));
  const j = sub.toJSON();
  await restApi(session, `/push_subscriptions?on_conflict=endpoint`, { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: JSON.stringify({
    user_id: session.user.id, endpoint: sub.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "", ua: navigator.userAgent.slice(0, 200),
  }) });
  await restApi(session, `/notification_prefs?on_conflict=user_id`, { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: JSON.stringify({
    user_id: session.user.id, push: true, ...prefs, updated_at: new Date().toISOString(),
  }) });
  return true;
}

export async function disableReminders(): Promise<void> {
  const session = await freshSession();
  if (!session) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) { await restApi(session, `/push_subscriptions?endpoint=eq.${encodeURIComponent(sub.endpoint)}`, { method: "DELETE", prefer: "return=minimal" }); await sub.unsubscribe(); }
  await restApi(session, `/notification_prefs?on_conflict=user_id`, { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: JSON.stringify({ user_id: session.user.id, push: false, updated_at: new Date().toISOString() }) });
}

export async function getReminderPrefs(): Promise<ReminderPrefs | null> {
  const session = await freshSession();
  if (!session) return null;
  const rows = (await restApi(session, `/notification_prefs?select=push,send_at,quiet_start,quiet_end,adaptive&user_id=eq.${session.user.id}&limit=1`)) as ReminderPrefs[];
  const r = rows[0];
  return r ? { push: r.push, send_at: String(r.send_at).slice(0, 5), quiet_start: String(r.quiet_start).slice(0, 5), quiet_end: String(r.quiet_end).slice(0, 5), adaptive: r.adaptive } : null;
}
