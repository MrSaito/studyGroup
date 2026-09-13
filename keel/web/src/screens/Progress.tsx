import { doneUnitIds, type ConsistencyScore, type Projection, type Unit } from "@keel/engine";
import type { Ctx } from "../app.tsx";
import { CourseLine } from "./Today.tsx";

type Cell = "done" | "current" | "todo" | "buffer" | "buffer-done";

export function Progress(p: { ctx: Ctx; projection: Projection; score: ConsistencyScore }) {
  const { ctx, projection, score } = p;
  const { t } = ctx;
  const done = doneUnitIds(ctx.enrollment);
  const currentId = projection.items[0]?.unit.id;
  const inProjection = new Set(projection.items.map((i) => i.unit.id));
  const cellOf = (u: Unit): Cell => {
    if (u.id === currentId) return "current";
    if (done.has(u.id)) return u.is_buffer ? "buffer-done" : "done";
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
      {[...stages.entries()].map(([stage, weeks]) => (
        <div class="stage" key={stage}>
          <h3>{t.stage} {stage}</h3>
          {[...weeks.entries()].map(([week, units]) => (
            <div class="week" key={week}>
              <span class="week-label">{t.week} {week}</span>
              <div class="cells">
                {units.map((u) => <span key={u.id} class={`cell ${cellOf(u)}`} title={u.title} aria-label={`${u.title}: ${cellOf(u)}`} />)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
