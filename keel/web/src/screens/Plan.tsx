import { useEffect, useState } from "preact/hooks";
import { doneUnitIds, skippedUnitIds, type Projection, type Unit } from "@keel/engine";
import type { Ctx } from "../app.tsx";
import { fmtDate } from "./Today.tsx";

type Status = "done" | "skipped" | "current" | "todo" | "buffer" | "consumed";

// Plan screen (Blueprint §5.5, A4): the read-only sequence, grouped by stage
// and week, with one action — skip a unit with a reason. A skip advances the
// sequence, is not a session, and never spends the day.
export function PlanScreen(p: { ctx: Ctx; projection: Projection }) {
  const { ctx, projection } = p;
  const { t } = ctx;
  const done = doneUnitIds(ctx.enrollment);
  const skipped = skippedUnitIds(ctx.enrollment);
  const currentId = projection.items[0]?.unit.id;
  const dates = new Map(projection.items.map((i) => [i.unit.id, i.date]));
  const [skipping, setSkipping] = useState<Unit | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  // 252 rows is a long list: land on the current unit (no smooth scroll — reduced-motion users get the same jump).
  useEffect(() => { document.querySelector(".plan-row.current")?.scrollIntoView({ block: "center" }); }, []);

  const statusOf = (u: Unit): Status => {
    if (u.id === currentId) return "current";
    if (done.has(u.id)) return "done";
    if (skipped.has(u.id)) return "skipped";
    if (u.is_buffer) return dates.has(u.id) ? "buffer" : "consumed";
    return "todo";
  };
  const typeLabel: Record<Unit["type"], string> = { learn: t.typeLearn, build: t.typeBuild, review: t.typeReview, rest: t.typeRest };

  const stages = new Map<number, Map<number, Unit[]>>();
  for (const u of ctx.enrollment.plan.units) {
    const w = stages.get(u.stage) ?? new Map<number, Unit[]>();
    w.set(u.week, [...(w.get(u.week) ?? []), u]);
    stages.set(u.stage, w);
  }

  const confirmSkip = async () => {
    if (!skipping) return;
    setBusy(true);
    await ctx.complete({ unit_id: skipping.id, date: ctx.today, outcome: "skipped", log_text: reason.trim() });
    setBusy(false); setSkipping(null); setReason("");
  };

  return (
    <section class="plan">
      <h2>{ctx.enrollment.plan.title}</h2>
      <p class="muted">{ctx.enrollment.plan.units.length} {t.units}</p>
      {[...stages.entries()].map(([stage, weeks]) => (
        <div class="stage" key={stage}>
          <h3>{t.stage} {stage}</h3>
          {[...weeks.entries()].map(([week, units]) => (
            <div key={week}>
              <span class="week-label">{t.week} {week}</span>
              <ul class="plan-list">
                {units.map((u) => {
                  const st = statusOf(u);
                  const date = dates.get(u.id);
                  return (
                    <li key={u.id} class={`plan-row ${st}`} data-seq={u.seq} data-status={st}>
                      <span class="seq" aria-hidden="true">{u.seq}</span>
                      <div class="plan-open" role="button" tabIndex={0} aria-label={`${t.details}: ${u.is_buffer ? t.restDay : u.title}`}
                        onClick={() => ctx.go({ name: "detail", unit: u, from: { name: "plan" } })}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ctx.go({ name: "detail", unit: u, from: { name: "plan" } }); } }}>
                        <span class="plan-title">{u.is_buffer ? t.restDay : u.title}</span>
                        <span class="plan-meta">
                          {typeLabel[u.type]} · {u.est_minutes} {t.min}
                          {st === "done" ? ` · ${t.done}` : st === "skipped" ? ` · ${t.skipped}` : date ? ` · ${fmtDate(date, ctx.locale)}` : ""}
                        </span>
                      </div>
                      {(st === "todo" || st === "current") && !u.is_buffer && (
                        <button class="link" onClick={() => { setSkipping(u); setReason(""); }} aria-label={`${t.skipUnit}: ${u.title}`}>{t.skipUnit}</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
      {skipping && (
        <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="skip-title">
          <h3 id="skip-title">{skipping.title}</h3>
          <p class="muted">{t.skipHint}</p>
          <label>{t.skipReason}
            <textarea rows={2} value={reason} onInput={(e) => setReason((e.target as HTMLTextAreaElement).value)} />
          </label>
          <button class="primary" disabled={busy || reason.trim().length < 2} onClick={confirmSkip}>{t.skipConfirm}</button>
          <button class="link" onClick={() => setSkipping(null)}>{t.cancel}</button>
        </div>
      )}
    </section>
  );
}
