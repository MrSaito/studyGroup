import { useState } from "preact/hooks";
import { buildReturnUnit, halveNextTwoWeeks, daySpent, isReviewDay, weekStart, type LapseState, type Projection } from "@keel/engine";
import type { Ctx } from "../app.tsx";

export function fmtDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString(locale === "ur" ? "ur-PK" : "en-GB", { day: "numeric", month: "short" });
}

export function CourseLine(p: { ctx: Ctx; projection: Projection }) {
  const { ctx, projection } = p;
  const total = ctx.enrollment.plan.units.length;
  const current = projection.items[0]?.unit.seq ?? total + 1;
  const pct = Math.min(100, Math.round(((current - 1) / total) * 100));
  return (
    <div class="course" aria-label={`${pct}%`}>
      <div class="course-line"><span class="course-dot" style={{ insetInlineStart: `${pct}%` }} /></div>
      <div class="course-meta">
        <span>{projection.position}</span>
        {projection.projected_finish && <span>{ctx.t.finishBy} {fmtDate(projection.projected_finish, ctx.locale)}</span>}
      </div>
    </div>
  );
}

// Friday/Sunday nudge for the weekly review (Blueprint §3.6). Never blocks the unit card.
function ReviewPrompt(p: { ctx: Ctx }) {
  const { ctx } = p;
  const due = isReviewDay(ctx.today) && !ctx.reviews.some((r) => r.week_start === weekStart(ctx.today));
  if (!due) return null;
  return (
    <div class="review-card" data-review-prompt>
      <p class="eyebrow">{ctx.t.weeklyReview} · 5 {ctx.t.min}</p>
      <p class="muted">{ctx.t.weeklyReviewHint}</p>
      <button class="secondary" onClick={() => ctx.go({ name: "review" })}>{ctx.t.weeklyReview}</button>
    </div>
  );
}

export function Today(p: { ctx: Ctx; projection: Projection; lapseState: LapseState }) {
  const { ctx, projection, lapseState } = p;
  const { t } = ctx;
  const [sheet, setSheet] = useState(false);
  const current = projection.items[0]?.unit;

  // Lapse flows come before the unit card (Blueprint §3.4). They never show a count.
  if (lapseState.tier === "archive_prompt" && current) {
    const stageStart = ctx.enrollment.plan.units.find((u) => u.stage === current.stage)!;
    return (
      <section class="today">
        <h2>{t.archiveTitle}</h2>
        <p class="muted">{t.archiveHint}</p>
        <blockquote class="why">{ctx.rec.why}</blockquote>
        <button class="primary" onClick={async () => {
          // Restart = fresh enrollment from this stage: rebuild plan from stageStart, wipe history.
          const plan = { ...ctx.rec.plan, version: ctx.rec.plan.version + 1, units: ctx.rec.plan.units.filter((u) => u.seq >= stageStart.seq).map((u, i) => ({ ...u, seq: i + 1 })) };
          await ctx.restart({ ...ctx.rec, plan, started_at: ctx.today });
        }}>{t.archiveRestart}</button>
        <button class="secondary" onClick={() => ctx.reset()}>{t.archiveAway}</button>
      </section>
    );
  }
  if (lapseState.tier === "replan" && current) {
    return (
      <section class="today">
        <h2>{t.replanTitle}</h2>
        <p class="muted">{t.replanHint}</p>
        <blockquote class="why">{ctx.rec.why}</blockquote>
        <button class="primary" onClick={async () => { await ctx.replacePlan(halveNextTwoWeeks(ctx.rec.plan, current.seq, ctx.locale)); ctx.go({ name: "unit", unit: buildReturnUnit(ctx.enrollment, ctx.locale), mode: "review" }); }}>{t.replanYes}</button>
        <button class="secondary" onClick={() => ctx.go({ name: "unit", unit: buildReturnUnit(ctx.enrollment, ctx.locale), mode: "review" })}>{t.replanNo}</button>
      </section>
    );
  }
  if (lapseState.tier === "return" && current) {
    const r = buildReturnUnit(ctx.enrollment, ctx.locale);
    return (
      <section class="today">
        <p class="eyebrow">{t.returnHint}</p>
        <h2 class="unit-title">{t.returnTitle}</h2>
        <p class="muted">{r.est_minutes} {t.min}</p>
        <blockquote class="why">{ctx.rec.why}</blockquote>
        <button class="primary" onClick={() => ctx.go({ name: "unit", unit: r, mode: "review" })}>{t.start}</button>
      </section>
    );
  }

  if (!current) {
    return <section class="today"><h2>{t.planComplete}</h2><p class="muted">{t.planCompleteHint}</p></section>;
  }

  const unit = projection.today;
  if (!unit) {
    const next = projection.items[0]!;
    return (
      <section class="today">
        <ReviewPrompt ctx={ctx} />
        <p class="eyebrow">{daySpent(ctx.enrollment, ctx.today) ? t.doneForToday : t.noSessionToday}</p>
        <h2 class="unit-title">{next.unit.title}</h2>
        <p class="muted">{t.nextUp}: {fmtDate(next.date, ctx.locale)} · {next.unit.est_minutes} {t.min}</p>
        <CourseLine ctx={ctx} projection={projection} />
      </section>
    );
  }

  if (unit.is_buffer) {
    return (
      <section class="today">
        <ReviewPrompt ctx={ctx} />
        <p class="eyebrow">{t.today}</p>
        <h2 class="unit-title">{t.restDay}</h2>
        <p class="muted">{t.restHint}</p>
        <button class="primary" onClick={() => ctx.complete({ unit_id: unit.id, date: ctx.today, outcome: "done" })}>{t.markRest}</button>
        <CourseLine ctx={ctx} projection={projection} />
      </section>
    );
  }

  return (
    <section class="today">
      <ReviewPrompt ctx={ctx} />
      <p class="eyebrow">{t.today}</p>
      <h2 class="unit-title">{unit.title}</h2>
      <p class="muted">{unit.est_minutes} {t.min}{unit.is_checkpoint ? ` · ${t.checkpoint}` : ""}</p>
      <p class="do">{unit.do}</p>
      <button class="primary" onClick={() => ctx.go({ name: "unit", unit, mode: "plan" })}>{t.start}</button>
      <button class="link" onClick={() => setSheet(true)}>{t.notToday}</button>
      <CourseLine ctx={ctx} projection={projection} />
      {sheet && (
        <div class="sheet" role="dialog" aria-modal="true">
          <button class="secondary" onClick={async () => { await ctx.complete({ unit_id: unit.id, date: ctx.today, outcome: "pushed" }); setSheet(false); }}>{t.pushTomorrow}</button>
          <button class="secondary" onClick={() => { setSheet(false); ctx.go({ name: "unit", unit: buildReturnUnit(ctx.enrollment, ctx.locale), mode: "review" }); }}>{t.swapReview}</button>
          <button class="link" onClick={() => setSheet(false)}>{t.cancel}</button>
        </div>
      )}
    </section>
  );
}
