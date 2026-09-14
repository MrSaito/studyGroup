import { doneUnitIds, type Projection, type Unit } from "@keel/engine";
import type { Ctx, Screen } from "../app.tsx";
import { Field } from "./Unit.tsx";
import { fmtDate } from "./Today.tsx";

// Read-only view of any unit — past (what you did, when, your log), current,
// or upcoming (projected date). Reached from Plan rows and Progress cells.
export function UnitDetail(p: { ctx: Ctx; unit: Unit; projection: Projection; from: Screen }) {
  const { ctx, unit, projection } = p;
  const { t } = ctx;
  const rows = ctx.completions.filter((c) => c.unit_id === unit.id);
  const doneRow = [...rows].reverse().find((c) => c.outcome === "done");
  const skipRow = rows.find((c) => c.outcome === "skipped");
  const reviews = rows.filter((c) => c.outcome === "swapped_review");
  const planned = projection.items.find((i) => i.unit.id === unit.id)?.date;
  const isCurrent = projection.items[0]?.unit.id === unit.id;
  const canStart = isCurrent && !unit.is_buffer && (projection.today?.id === unit.id || !doneUnitIds(ctx.enrollment).has(unit.id));
  const typeLabel: Record<Unit["type"], string> = { learn: t.typeLearn, build: t.typeBuild, review: t.typeReview, rest: t.typeRest };

  return (
    <section class="unit detail">
      <button class="link back" onClick={() => ctx.go(p.from)}>{t.back}</button>
      <p class="eyebrow">{t.stage} {unit.stage} · {t.week} {unit.week} · {typeLabel[unit.type]} · {unit.est_minutes} {t.min}{unit.is_checkpoint ? ` · ${t.checkpoint}` : ""}</p>
      <h2 class="unit-title">{unit.is_buffer ? t.restDay : unit.title}</h2>
      {doneRow && <p class="status" data-status="done">{t.doneOn} {fmtDate(doneRow.date, ctx.locale)}{doneRow.minutes ? ` · ${doneRow.minutes} ${t.minutesLogged}` : ""}</p>}
      {skipRow && <p class="status" data-status="skipped">{t.skippedBecause} {skipRow.log_text || "—"}</p>}
      {!doneRow && !skipRow && planned && <p class="status" data-status="planned">{t.plannedFor} {fmtDate(planned, ctx.locale)}</p>}
      {doneRow?.log_text && <div class="field"><h3>{t.yourLog}</h3><blockquote class="why">{doneRow.log_text}</blockquote></div>}
      {reviews.map((r) => r.log_text && <div class="field" key={r.date}><h3>{t.typeReview} · {fmtDate(r.date, ctx.locale)}</h3><blockquote class="why">{r.log_text}</blockquote></div>)}
      <Field label={t.learn} text={unit.learn} />
      <Field label={t.do} text={unit.do} />
      <Field label={t.tip} text={unit.tip} />
      <Field label={t.deliverable} text={unit.deliverable} />
      {canStart && !doneRow && <button class="primary" onClick={() => ctx.go({ name: "unit", unit, mode: "plan" })}>{t.start}</button>}
    </section>
  );
}
