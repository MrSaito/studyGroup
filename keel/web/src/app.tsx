import { useEffect, useMemo, useState } from "preact/hooks";
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
  restore: (d: { enrollment: EnrollmentRecord; completions: CompletionRow[]; reviews: ReviewRow[] }) => Promise<void>;
  setLocale: (l: Locale) => Promise<void>;
}

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rec, setRec] = useState<EnrollmentRecord | null | undefined>(undefined);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [t, setT] = useState<Strings>(en);
  const [screen, setScreen] = useState<Screen>({ name: "today" });
  const [today, setToday] = useState(todayLocal());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await store.getSettings();
        if (!isLocale(settings.locale)) settings.locale = "en";
        setT(await loadStrings(settings.locale as Locale));
        const rec = (await store.getEnrollment()) ?? null;
        const completions = await store.listCompletions();
        setSettings(settings); setRec(rec); setCompletions(completions);
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
    const onVis = () => { if (document.visibilityState === "visible") setToday(todayLocal()); };
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

  const setLocale = async (l: Locale) => { setT(await loadStrings(l)); const s = { ...settings, locale: l }; await store.putSettings(s); setSettings(s); };

  if (!rec || !enrollment) {
    return <Onboarding t={t} locale={locale} setLocale={setLocale} today={today} onDone={async (r) => {
      try { await store.putEnrollment(r); setRec(r); setCompletions([]); setScreen({ name: "today" }); }
      catch { setError(t.storageFail); }
    }} error={error} />;
  }

  const ctx: Ctx = {
    t, locale, today, rec, enrollment, completions, reviews,
    go: setScreen,
    complete: async (c) => {
      try { const row = await store.appendCompletion(c); setCompletions((xs) => [...xs, row]); }
      catch { setError(t.storageFail); }
    },
    addReview: async (r) => {
      try { const row = await store.addReview(r); setReviews((xs) => [...xs, row]); }
      catch { setError(t.storageFail); }
    },
    replacePlan: async (plan) => { const r = { ...rec, plan }; await store.putEnrollment(r); setRec(r); },
    reset: async () => { await store.reset(); setRec(null); setCompletions([]); setReviews([]); setScreen({ name: "today" }); },
    restart: async (r) => { await store.reset(); await store.putEnrollment(r); setRec(r); setCompletions([]); setReviews([]); setScreen({ name: "today" }); },
    updateRec: async (patch) => { const r = { ...rec, ...patch }; await store.putEnrollment(r); setRec(r); },
    restore: async (d) => {
      try { await store.restore(d); setRec(d.enrollment); setCompletions(await store.listCompletions()); setReviews(await store.listReviews()); setScreen({ name: "today" }); }
      catch { setError(t.storageFail); }
    },
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
