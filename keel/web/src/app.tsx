import { useEffect, useMemo, useState } from "preact/hooks";
import { consistency, lapse, project, type Completion, type Enrollment, type Plan } from "@keel/engine";
import { store, type EnrollmentRecord, type CompletionRow, type Settings } from "./store.ts";
import { todayLocal } from "./clock.ts";
import { STRINGS, RTL, type Locale, type Strings } from "./i18n.ts";
import { Onboarding } from "./screens/Onboarding.tsx";
import { Today } from "./screens/Today.tsx";
import { UnitScreen } from "./screens/Unit.tsx";
import { Progress } from "./screens/Progress.tsx";
import { SettingsScreen } from "./screens/Settings.tsx";
import type { Unit } from "@keel/engine";

export type Screen = { name: "today" } | { name: "unit"; unit: Unit; mode: "plan" | "review" } | { name: "progress" } | { name: "settings" };

export interface Ctx {
  t: Strings;
  locale: Locale;
  today: string;
  rec: EnrollmentRecord;
  enrollment: Enrollment;
  completions: CompletionRow[];
  go: (s: Screen) => void;
  complete: (c: Completion) => Promise<void>;
  replacePlan: (p: Plan) => Promise<void>;
  reset: () => Promise<void>;
  restart: (r: EnrollmentRecord) => Promise<void>;
  setLocale: (l: Locale) => Promise<void>;
}

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rec, setRec] = useState<EnrollmentRecord | null | undefined>(undefined);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: "today" });
  const [today, setToday] = useState(todayLocal());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSettings(await store.getSettings());
        setRec((await store.getEnrollment()) ?? null);
        setCompletions(await store.listCompletions());
      } catch (e) { setError(String(e)); setRec(null); setSettings({ locale: "en" }); }
    })();
    // Roll the date when the app is resumed after midnight.
    const onVis = () => { if (document.visibilityState === "visible") setToday(todayLocal()); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const locale = settings?.locale ?? "en";
  const t = STRINGS[locale];
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL[locale] ? "rtl" : "ltr";
  }, [locale]);

  const enrollment = useMemo<Enrollment | null>(() => rec ? {
    plan: rec.plan, started_at: rec.started_at, availability: rec.availability,
    completions: completions.map(({ unit_id, date, outcome, minutes, log_text }) => ({ unit_id, date, outcome, minutes, log_text })),
  } : null, [rec, completions]);

  if (settings === null || rec === undefined) return <main class="shell"><p class="muted">…</p></main>;

  const setLocale = async (l: Locale) => { const s = { ...settings, locale: l }; await store.putSettings(s); setSettings(s); };

  if (!rec || !enrollment) {
    return <Onboarding t={t} locale={locale} setLocale={setLocale} today={today} onDone={async (r) => {
      try { await store.putEnrollment(r); setRec(r); setCompletions([]); setScreen({ name: "today" }); }
      catch { setError(t.storageFail); }
    }} error={error} />;
  }

  const ctx: Ctx = {
    t, locale, today, rec, enrollment, completions,
    go: setScreen,
    complete: async (c) => {
      try { const row = await store.appendCompletion(c); setCompletions((xs) => [...xs, row]); }
      catch { setError(t.storageFail); }
    },
    replacePlan: async (plan) => { const r = { ...rec, plan }; await store.putEnrollment(r); setRec(r); },
    reset: async () => { await store.reset(); setRec(null); setCompletions([]); setScreen({ name: "today" }); },
    restart: async (r) => { await store.reset(); await store.putEnrollment(r); setRec(r); setCompletions([]); setScreen({ name: "today" }); },
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
      {screen.name === "progress" && <Progress ctx={ctx} projection={projection} score={score} />}
      {screen.name === "settings" && <SettingsScreen ctx={ctx} />}
      {screen.name !== "unit" && (
        <nav class="tabs" aria-label="Sections">
          <button class={screen.name === "today" ? "on" : ""} onClick={() => setScreen({ name: "today" })}>{t.today}</button>
          <button class={screen.name === "progress" ? "on" : ""} onClick={() => setScreen({ name: "progress" })}>{t.progress}</button>
          <button class={screen.name === "settings" ? "on" : ""} onClick={() => setScreen({ name: "settings" })}>{t.settings}</button>
        </nav>
      )}
    </main>
  );
}
