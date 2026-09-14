import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { buildReturnUnit, consistency, lapse, project, type Completion, type Enrollment, type Plan } from "@keel/engine";
import { store, type EnrollmentRecord, type CompletionRow, type ReviewRow, type Settings } from "./store.ts";
import { todayLocal } from "./clock.ts";
import { en, loadStrings, isLocale, RTL, type Locale, type Strings } from "./i18n.ts";
import { Onboarding } from "./screens/Onboarding.tsx";
import { Today } from "./screens/Today.tsx";
import { UnitScreen } from "./screens/Unit.tsx";
import { Progress } from "./screens/Progress.tsx";
import { SettingsScreen } from "./screens/Settings.tsx";
import { PlanScreen } from "./screens/Plan.tsx";
import { ReviewScreen } from "./screens/Review.tsx";
import { UnitDetail } from "./screens/UnitDetail.tsx";
import type { Sync, SyncReport } from "./sync.ts";
import type { Session } from "./auth.ts";
import { track } from "./events.ts";
type Backend = typeof import("./backend.ts");
import { BACKEND, BACKEND_CONFIGURED } from "./config.ts";
import type { Unit } from "@keel/engine";

export type Screen = { name: "today" } | { name: "unit"; unit: Unit; mode: "plan" | "review" } | { name: "plan" } | { name: "progress" } | { name: "review" } | { name: "settings" } | { name: "detail"; unit: Unit; from: Screen };

export interface Ctx {
  t: Strings;
  locale: Locale;
  today: string;
  rec: EnrollmentRecord;
  enrollment: Enrollment;
  completions: CompletionRow[];
  reviews: ReviewRow[];
  go: (s: Screen) => void;
  complete: (c: Completion) => Promise<void>;
  addReview: (r: Omit<ReviewRow, "id" | "created_at">) => Promise<void>;
  replacePlan: (p: Plan) => Promise<void>;
  reset: () => Promise<void>;
  restart: (r: EnrollmentRecord) => Promise<void>;
  updateRec: (patch: Partial<Pick<EnrollmentRecord, "availability" | "intention" | "why">>) => Promise<void>;
  session: Session | null;
  sync: SyncReport;
  syncNow: () => Promise<void>;
  onSignedIn: () => Promise<void>;
  /** Sign out; with wipe=true also delete local data (after account deletion). */
  signOutAll: (wipe: boolean) => Promise<void>;
  restore: (d: { enrollment: EnrollmentRecord; completions: CompletionRow[]; reviews: ReviewRow[] }) => Promise<void>;
  setLocale: (l: Locale) => Promise<void>;
}

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rec, setRec] = useState<EnrollmentRecord | null | undefined>(undefined);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [t, setT] = useState<Strings>(en);
  const [session, setSession] = useState<Session | null>(null);
  const [syncReport, setSyncReport] = useState<SyncReport>({ status: "signed_out", last_sync_at: null, pulled: 0 });
  const recRef = useRef<EnrollmentRecord | null>(null);
  const syncRef = useRef<Sync | null>(null);
  const beRef = useRef<Backend | null>(null);
  const backendOn = BACKEND_CONFIGURED || /^http:\/\/(127\.0\.0\.1|localhost)/.test(BACKEND.url);
  const [screen, setScreen] = useState<Screen>({ name: "today" });
  const [today, setToday] = useState(todayLocal());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await store.getSettings();
        if (!isLocale(settings.locale)) settings.locale = "en";
        setT(await loadStrings(settings.locale as Locale));
        let rec = (await store.getEnrollment()) ?? null;
        if (rec && (!rec.id || !rec.updated_at)) { rec = { ...rec, id: rec.id ?? crypto.randomUUID(), updated_at: rec.updated_at ?? new Date().toISOString() }; await store.putEnrollment(rec); }
        const completions = await store.listCompletions();
        setSettings(settings); setRec(rec); setCompletions(completions); recRef.current = rec;
        if (backendOn) {
          const be = await import("./backend.ts");
          beRef.current = be;
          try { setSession(await be.freshSession()); } catch { setSession(null); }
          if (new URLSearchParams(location.search).get("from") === "push") { track("notification_opened"); history.replaceState(null, "", location.pathname); }
          syncRef.current = new be.Sync({
            getRec: () => recRef.current,
            onEnrollment: async (r) => { await store.putEnrollment(r); recRef.current = r; setRec(r); setCompletions(await store.listCompletions()); setReviews(await store.listReviews()); },
            onPulled: async () => { setCompletions(await store.listCompletions()); setReviews(await store.listReviews()); },
            onStatus: setSyncReport,
          });
          void syncRef.current.run();
          addEventListener("online", () => void syncRef.current?.run());
        }
        setReviews(await store.listReviews());
        // A2: a unit with a timer in progress reopens where the learner left it after a reload.
        const timer = await store.getTimer();
        if (rec && timer) {
          const advanced = new Set(completions.filter((c) => c.outcome === "done" || c.outcome === "skipped").map((c) => c.unit_id));
          const unit = rec.plan.units.find((u) => u.id === timer.unit_id);
          if (unit && advanced.has(unit.id)) await store.clearTimer().catch(() => {}); // stale: the unit is already done
          else if (unit) setScreen({ name: "unit", unit, mode: "plan" });
          else if (timer.unit_id.startsWith("return-")) {
            const e: Enrollment = { plan: rec.plan, started_at: rec.started_at, availability: rec.availability, completions };
            const r = buildReturnUnit(e, settings.locale as Locale);
            if (r.id === timer.unit_id) setScreen({ name: "unit", unit: r, mode: "review" });
          }
        }
      } catch (e) { setError(String(e)); setRec(null); setSettings({ locale: "en" }); }
    })();
    // Roll the date when the app is resumed after midnight.
    const onVis = () => { if (document.visibilityState === "visible") { setToday(todayLocal()); void syncRef.current?.run(); } };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const locale = (settings && isLocale(settings.locale) ? settings.locale : "en") as Locale;
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL[locale] ? "rtl" : "ltr";
  }, [locale]);

  const enrollment = useMemo<Enrollment | null>(() => rec ? {
    plan: rec.plan, started_at: rec.started_at, availability: rec.availability,
    completions: completions.map(({ unit_id, date, outcome, minutes, log_text }) => ({ unit_id, date, outcome, minutes, log_text })),
  } : null, [rec, completions]);

  if (settings === null || rec === undefined) return <main class="shell"><p class="muted">…</p></main>;

  const setLocale = async (l: Locale) => { setT(await loadStrings(l)); const s = { ...settings, locale: l }; await store.putSettings(s); setSettings(s); if (session) beRef.current?.pushProfile(l).catch(() => {}); };
  const putRec = async (r: EnrollmentRecord | null) => { recRef.current = r; setRec(r); };
  const onSignedIn = async () => {
    const be = beRef.current;
    if (!be) return;
    const s = await be.freshSession().catch(() => null);
    setSession(s);
    if (!s) return;
    track("signed_in");
    be.pushProfile(locale).catch(() => {});
    await syncRef.current?.run();
  };
  const signOutAll = async (wipe: boolean) => {
    await beRef.current?.signOut();
    setSession(null);
    setSyncReport({ status: "signed_out", last_sync_at: null, pulled: 0 });
    if (wipe) { await store.reset(); await putRec(null); setCompletions([]); setReviews([]); setScreen({ name: "today" }); }
    else await store.clearSyncState();
  };

  if (!rec || !enrollment) {
    return <Onboarding t={t} locale={locale} setLocale={setLocale} today={today} onDone={async (r) => {
      const full = { ...r, id: crypto.randomUUID(), updated_at: new Date().toISOString() };
      try { await store.putEnrollment(full); await putRec(full); setCompletions([]); setScreen({ name: "today" }); syncRef.current?.request(); }
      catch { setError(t.storageFail); }
    }} error={error} signIn={backendOn && !session ? onSignedIn : undefined} />;
  }

  const ctx: Ctx = {
    t, locale, today, rec, enrollment, completions, reviews,
    go: (s) => {
      if (s.name === "unit") track(s.mode === "review" ? "return_started" : "unit_started", { unit_id: s.unit.id });
      setScreen(s);
    },
    complete: async (c) => {
      try {
        const row = await store.appendCompletion(c); setCompletions((xs) => [...xs, row]);
        if (c.outcome === "done") track("unit_done", { unit_id: c.unit_id, minutes: c.minutes ?? 0 });
        else if (c.outcome === "skipped") track("unit_skipped", { unit_id: c.unit_id });
        else track(c.outcome, { unit_id: c.unit_id });
        syncRef.current?.request();
      } catch { setError(t.storageFail); }
    },
    addReview: async (r) => {
      try { const row = await store.addReview(r); setReviews((xs) => [...xs, row]); track("review_saved"); syncRef.current?.request(); }
      catch { setError(t.storageFail); }
    },
    replacePlan: async (plan) => { const r = { ...rec, plan, updated_at: new Date().toISOString() }; await store.putEnrollment(r); await putRec(r); track("replan_accepted"); syncRef.current?.request(); },
    reset: async () => { await store.reset(); await putRec(null); setCompletions([]); setReviews([]); setScreen({ name: "today" }); },
    restart: async (r) => { const full = { ...r, id: crypto.randomUUID(), updated_at: new Date().toISOString() }; await store.reset(); await store.putEnrollment(full); await putRec(full); setCompletions([]); setReviews([]); setScreen({ name: "today" }); syncRef.current?.request(); },
    updateRec: async (patch) => { const r = { ...rec, ...patch, updated_at: new Date().toISOString() }; await store.putEnrollment(r); await putRec(r); syncRef.current?.request(); },
    restore: async (d) => {
      try {
        const e = { ...d.enrollment, id: d.enrollment.id ?? crypto.randomUUID(), updated_at: new Date().toISOString() };
        await store.restore({ ...d, enrollment: e }); await putRec(e); setCompletions(await store.listCompletions()); setReviews(await store.listReviews()); setScreen({ name: "today" }); syncRef.current?.request();
      } catch { setError(t.storageFail); }
    },
    session, sync: syncReport,
    syncNow: async () => { await syncRef.current?.run(); },
    onSignedIn, signOutAll,
    setLocale,
  };

  // Derived state is computed here once per render; screens are pure views.
  const projection = project(enrollment, today);
  const score = consistency(enrollment, today);
  const lapseState = lapse(enrollment, today);

  return (
    <main class="shell">
      {error && <p class="notice" role="alert">{error}</p>}
      {screen.name === "today" && <Today ctx={ctx} projection={projection} lapseState={lapseState} />}
      {screen.name === "unit" && <UnitScreen ctx={ctx} unit={screen.unit} mode={screen.mode} projection={projection} />}
      {screen.name === "plan" && <PlanScreen ctx={ctx} projection={projection} />}
      {screen.name === "progress" && <Progress ctx={ctx} projection={projection} score={score} />}
      {screen.name === "review" && <ReviewScreen ctx={ctx} />}
      {screen.name === "detail" && <UnitDetail ctx={ctx} unit={screen.unit} projection={projection} from={screen.from} />}
      {screen.name === "settings" && <SettingsScreen ctx={ctx} />}
      {screen.name !== "unit" && screen.name !== "review" && screen.name !== "detail" && (
        <nav class="tabs" aria-label="Sections">
          {([["today", t.today], ["plan", t.plan], ["progress", t.progress], ["settings", t.settings]] as const).map(([name, label]) => (
            <button key={name} data-tab={name} class={screen.name === name ? "on" : ""} aria-current={screen.name === name ? "page" : undefined} onClick={() => setScreen({ name } as Screen)}>{label}</button>
          ))}
        </nav>
      )}
    </main>
  );
}
