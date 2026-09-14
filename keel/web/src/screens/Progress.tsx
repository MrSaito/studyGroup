import { doneUnitIds, skippedUnitIds, weekStart, compareDates, type ConsistencyScore, type Projection, type Unit } from "@keel/engine";
import type { Ctx } from "../app.tsx";
import { CourseLine } from "./Today.tsx";

type Cell = "done" | "skipped" | "current" | "todo" | "buffer" | "buffer-done";

export function Progress(p: { ctx: Ctx; projection: Projection; score: ConsistencyScore }) {
  const { ctx, projection, score } = p;
  const { t } = ctx;
  const done = doneUnitIds(ctx.enrollment);
  const skipped = skippedUnitIds(ctx.enrollment);
  const reviewed = ctx.reviews.some((r) => r.week_start === weekStart(ctx.today));
  const ws = weekStart(ctx.today);
  const thisWeek = ctx.completions.filter((c) => compareDates(c.date, ws) >= 0 && compareDates(c.date, ctx.today) <= 0 && (c.outcome === "done" || c.outcome === "swapped_review"));
  const weekSessions = new Set(thisWeek.map((c) => c.date)).size;
  const weekMinutes = thisWeek.reduce((n, c) => n + (c.minutes ?? 0), 0);
  const currentId = projection.items[0]?.unit.id;
  const inProjection = new Set(projection.items.map((i) => i.unit.id));
  const cellOf = (u: Unit): Cell => {
    if (u.id === currentId) return "current";
    if (done.has(u.id)) return u.is_buffer ? "buffer-done" : "done";
    if (skipped.has(u.id)) return "skipped";
    if (u.is_buffer) return inProjection.has(u.id) ? "buffer" : "buffer-done"; // consumed
    return "todo";
  };

  // stage → week → units
  const stages = new Map<number, Map<number, Unit[]>>();
  for (const u of ctx.enrollment.plan.units) {
    const w = stages.get(u.stage) ?? new Map<number, Unit[]>();
    w.set(u.week, [...(w.get(u.week) ?? []), u]);
    stages.set(u.stage, w);
  }

  return (
    <section class="progress">
      <h2>{ctx.enrollment.plan.title}</h2>
      <CourseLine ctx={ctx} projection={projection} />
      <p class="score"><strong>{score.percent}%</strong> <span class="muted">{t.ofLast28}</span></p>
      <p class="muted week-stats" data-week-sessions={weekSessions}>{t.thisWeek}: {weekSessions} {t.sessions} · {weekMinutes} {t.min}</p>
      {reviewed
        ? <p class="muted" data-reviewed>{t.reviewedThisWeek}</p>
        : <button class="secondary" data-action="review" onClick={() => ctx.go({ name: "review" })}>{t.weeklyReview}</button>}
      {[...stages.entries()].map(([stage, weeks]) => (
        <div class="stage" key={stage}>
          <h3>{t.stage} {stage}</h3>
          {[...weeks.entries()].map(([week, units]) => (
            <div class="week" key={week}>
              <span class="week-label">{t.week} {week}</span>
              <div class="cells">
                {units.map((u) => <button key={u.id} class={`cell ${cellOf(u)}`} title={u.title} aria-label={`${u.title}: ${cellOf(u)}`} onClick={() => ctx.go({ name: "detail", unit: u, from: { name: "progress" } })} />)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
