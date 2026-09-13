import { useState } from "preact/hooks";
import { importMarkdown, assertPlan, validatePlan, type Plan, type Weekday } from "@keel/engine";
import type { EnrollmentRecord } from "../store.ts";
import type { Locale, Strings } from "../i18n.ts";
import { TEMPLATES, type Template } from "../templates.ts";

const DAY_LABELS: Record<Locale, string[]> = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  ur: ["اتوار", "پیر", "منگل", "بدھ", "جمعرات", "جمعہ", "ہفتہ"],
};

function parsePlan(text: string): Plan {
  const s = text.trim();
  if (s.startsWith("{")) return assertPlan(JSON.parse(s));
  return importMarkdown(s);
}

export function Onboarding(p: { t: Strings; locale: Locale; setLocale: (l: Locale) => void; today: string; onDone: (r: EnrollmentRecord) => void; error: string | null }) {
  const { t } = p;
  const [step, setStep] = useState(0);
  const [why, setWhy] = useState("");
  const [planText, setPlanText] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planErr, setPlanErr] = useState<string | null>(null);
  const [days, setDays] = useState<Weekday[]>([1, 2, 3, 4, 5]);
  const [minutes, setMinutes] = useState(45);
  const [after, setAfter] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Pasted plans show their validation notes (capped: a long plan can carry a
  // hundred). Bundled templates are curated; their notes are accepted in
  // HANDOVER.md and not shown.
  const accept = (pl: Plan, showWarnings: boolean) => {
    const warnings = showWarnings ? validatePlan(pl).filter((i) => i.level === "warning") : [];
    const shown = warnings.slice(0, 3).map((w) => w.message);
    if (warnings.length > 3) shown.push(t.moreNotes.replace("{n}", String(warnings.length - 3)));
    setPlan(pl); setPlanErr(shown.length ? shown.join("\n") : null); setStep(2);
  };
  const tryImport = (text: string) => {
    try { accept(parsePlan(text), true); }
    catch (e) { setPlanErr(`${t.invalidPlan} ${(e as Error).message}`); }
  };
  const useTemplate = async (tpl: Template) => {
    setLoading(tpl.id); setPlanErr(null);
    try { accept(await tpl.load(), false); }
    catch { setPlanErr(t.templateLoadFail); }
    finally { setLoading(null); }
  };
  const toggleDay = (d: Weekday) => setDays((ds) => ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort());

  return (
    <main class="shell onboard">
      <header class="brand">
        <h1>{t.appName}</h1>
        <p>{t.tagline}</p>
        <button class="link" onClick={() => p.setLocale(p.locale === "en" ? "ur" : "en")}>{p.locale === "en" ? "اردو" : "English"}</button>
      </header>
      {p.error && <p class="notice" role="alert">{p.error}</p>}

      {step === 0 && <section>
        <h2>{t.onboardGoal}</h2>
        <p class="muted">{t.onboardGoalHint}</p>
        <textarea rows={3} value={why} onInput={(e) => setWhy((e.target as HTMLTextAreaElement).value)} />
        <button class="primary" disabled={why.trim().length < 3} onClick={() => setStep(1)}>{t.nextUp}</button>
      </section>}

      {step === 1 && <section>
        <h2>{t.onboardPlan}</h2>
        <p class="muted">{t.onboardPlanHint}</p>
        <textarea rows={8} value={planText} onInput={(e) => setPlanText((e.target as HTMLTextAreaElement).value)} spellcheck={false} />
        {planErr && <p class="notice">{planErr}</p>}
        <button class="primary" disabled={planText.trim().length === 0 || loading !== null} onClick={() => tryImport(planText)}>{t.importPlan}</button>
        <button class="secondary" data-template="ai-engineer-36w" disabled={loading !== null} aria-busy={loading === "ai-engineer-36w"} onClick={() => useTemplate(TEMPLATES["ai-engineer-36w"])}>{loading === "ai-engineer-36w" ? t.loading : t.useRoadmap}</button>
        <button class="secondary" data-template="sample" disabled={loading !== null} aria-busy={loading === "sample"} onClick={() => useTemplate(TEMPLATES.sample)}>{loading === "sample" ? t.loading : t.useSample}</button>
      </section>}

      {step === 2 && plan && <section>
        <h2>{t.onboardAvail}</h2>
        <p class="muted">{plan.title} — {plan.units.length} {t.units}</p>
        {planErr && <p class="notice">{planErr}</p>}
        <div class="days" role="group" aria-label={t.onboardAvail}>
          {DAY_LABELS[p.locale].map((l, i) => (
            <button key={i} class={days.includes(i as Weekday) ? "day on" : "day"} aria-pressed={days.includes(i as Weekday)} onClick={() => toggleDay(i as Weekday)}>{l}</button>
          ))}
        </div>
        <label>{t.minutesPerDay}
          <input type="number" min={10} max={240} step={5} value={minutes} onInput={(e) => setMinutes(Number((e.target as HTMLInputElement).value) || 45)} />
        </label>
        <button class="primary" disabled={days.length === 0} onClick={() => setStep(3)}>{t.nextUp}</button>
      </section>}

      {step === 3 && plan && <section>
        <h2>{t.onboardIntention}</h2>
        <p class="muted">{t.intentionHint}</p>
        <input placeholder={t.intentionAfter} value={after} onInput={(e) => setAfter((e.target as HTMLInputElement).value)} />
        <input placeholder={t.intentionPlace} value={place} onInput={(e) => setPlace((e.target as HTMLInputElement).value)} />
        <button class="primary" onClick={() => p.onDone({
          plan, started_at: p.today, availability: { days, minutes_per_day: minutes }, intention: { after, place }, why: why.trim(),
        })}>{t.startPlan}</button>
      </section>}
    </main>
  );
}
