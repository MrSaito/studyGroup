import { useState } from "preact/hooks";
import { assertPlan, type Weekday } from "@keel/engine";
import { store, type CompletionRow, type EnrollmentRecord, type ReviewRow } from "../store.ts";
import { APP_VERSION } from "../version.ts";
import { DAY_LABELS, LOCALES, isLocale, type Locale } from "../i18n.ts";
import type { Ctx } from "../app.tsx";
import { useLazy } from "../lazy.tsx";

/** Shape check for a Keel export file before it replaces local data. Throws on anything off. */
export function parseBackup(text: string): { enrollment: EnrollmentRecord; completions: CompletionRow[]; reviews: ReviewRow[] } {
  const d = JSON.parse(text) as Record<string, unknown>;
  const e = d.enrollment as Partial<EnrollmentRecord> | undefined;
  if (!e || typeof e !== "object" || !e.plan || typeof e.started_at !== "string" || !e.availability) throw new Error("no enrollment");
  const plan = assertPlan(e.plan);
  const days = (e.availability as { days?: unknown }).days;
  if (!Array.isArray(days) || days.length === 0 || !days.every((x) => Number.isInteger(x) && x >= 0 && x <= 6)) throw new Error("bad availability");
  const okRow = (c: unknown): c is CompletionRow => typeof c === "object" && c !== null
    && typeof (c as CompletionRow).id === "string" && typeof (c as CompletionRow).unit_id === "string"
    && typeof (c as CompletionRow).date === "string" && typeof (c as CompletionRow).outcome === "string" && typeof (c as CompletionRow).created_at === "string";
  const completions = Array.isArray(d.completions) ? d.completions : [];
  if (!completions.every(okRow)) throw new Error("bad completions");
  const reviews = Array.isArray(d.reviews) ? (d.reviews as ReviewRow[]).filter((r) => r && typeof r.id === "string" && typeof r.week_start === "string") : [];
  return {
    enrollment: { plan, started_at: e.started_at, availability: { days: days as Weekday[], minutes_per_day: Number((e.availability as { minutes_per_day?: unknown }).minutes_per_day) || 45 }, intention: e.intention ?? { after: "", place: "" }, why: e.why ?? "" },
    completions, reviews,
  };
}

export function SettingsScreen(p: { ctx: Ctx }) {
  const { ctx } = p;
  const { t } = ctx;
  const Account = useLazy<{ ctx: Ctx }>(() => import("./Account.tsx").then((m) => m.AccountSection));
  const [days, setDays] = useState<Weekday[]>(ctx.rec.availability.days);
  const [minutes, setMinutes] = useState(ctx.rec.availability.minutes_per_day);
  const [after, setAfter] = useState(ctx.rec.intention.after);
  const [place, setPlace] = useState(ctx.rec.intention.place);
  const [note, setNote] = useState<string | null>(null);
  const dirty = days.join() !== ctx.rec.availability.days.join() || minutes !== ctx.rec.availability.minutes_per_day
    || after !== ctx.rec.intention.after || place !== ctx.rec.intention.place;
  const toggleDay = (d: Weekday) => setDays((ds) => ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d].sort());

  const exportData = async () => {
    const data = await store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `keel-export-${ctx.today}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const save = async () => {
    await ctx.updateRec({ availability: { days, minutes_per_day: minutes }, intention: { after: after.trim(), place: place.trim() } });
    setNote(t.saved);
  };
  const restore = async (input: HTMLInputElement) => {
    const f = input.files?.[0]; input.value = "";
    if (!f) return;
    let parsed;
    try { parsed = parseBackup(await f.text()); } catch { setNote(t.restoreFail); return; }
    if (!confirm(t.restoreConfirm)) return;
    await ctx.restore(parsed);
    setNote(t.restored);
  };

  return (
    <section class="settings">
      <h2>{t.settings}</h2>
      <label>{t.language}
        <select value={ctx.locale} onChange={(e) => { const v = (e.target as HTMLSelectElement).value; if (isLocale(v)) ctx.setLocale(v as Locale); }}>
          {LOCALES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </label>
      {ctx.locale !== "en" && <p class="muted draft-note">{t.translationDraft}</p>}

      <h3>{t.workingDays}</h3>
      <div class="days" role="group" aria-label={t.workingDays}>
        {DAY_LABELS[ctx.locale].map((l, i) => (
          <button key={i} class={days.includes(i as Weekday) ? "day on" : "day"} aria-pressed={days.includes(i as Weekday)} onClick={() => toggleDay(i as Weekday)}>{l}</button>
        ))}
      </div>
      <label>{t.minutesPerDay}
        <input type="number" min={10} max={240} step={5} value={minutes} onInput={(e) => setMinutes(Number((e.target as HTMLInputElement).value) || 45)} />
      </label>
      <h3>{t.yourCue}</h3>
      <p class="muted">{t.intentionHint}</p>
      <input placeholder={t.intentionAfter} value={after} onInput={(e) => setAfter((e.target as HTMLInputElement).value)} />
      <input placeholder={t.intentionPlace} value={place} onInput={(e) => setPlace((e.target as HTMLInputElement).value)} />
      <button class="primary" data-action="save" disabled={!dirty || days.length === 0} onClick={save}>{t.saveChanges}</button>
      {note && <p class="notice" role="status">{note}</p>}

      {Account && <Account ctx={ctx} />}

      <h3>{t.exportData}</h3>
      <button class="secondary" onClick={exportData}>{t.exportData}</button>
      <label class="file">{t.restoreBackup}
        <input type="file" accept=".json,application/json" data-action="restore" onChange={(e) => restore(e.target as HTMLInputElement)} />
      </label>
      <button class="secondary" data-action="new-plan" onClick={() => { if (confirm(t.resetConfirm)) ctx.reset(); }}>{t.startNewPlan}</button>
      <button class="secondary danger" onClick={() => { if (confirm(t.resetConfirm)) ctx.reset(); }}>{t.resetApp}</button>
      <p class="muted">{t.version} {APP_VERSION}</p>
    </section>
  );
}
