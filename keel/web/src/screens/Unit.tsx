import { useEffect, useRef, useState } from "preact/hooks";
import type { Projection, Unit } from "@keel/engine";
import type { Ctx } from "../app.tsx";

function isUrl(s: string): boolean { return /^https?:\/\/\S+$/.test(s.trim()); }

function Field(p: { label: string; text?: string }) {
  if (!p.text) return null;
  return (
    <div class="field">
      <h3>{p.label}</h3>
      {p.text.split("\n").map((line, i) => isUrl(line)
        ? <p key={i}><a href={line.trim()} target="_blank" rel="noopener noreferrer">{line.trim()}</a></p>
        : <p key={i}>{line}</p>)}
    </div>
  );
}

export function UnitScreen(p: { ctx: Ctx; unit: Unit; mode: "plan" | "review"; projection: Projection }) {
  const { ctx, unit, mode } = p;
  const { t } = ctx;
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [log, setLog] = useState("");
  const [saving, setSaving] = useState(false);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);

  useEffect(() => {
    if (!running) return;
    startedAt.current = Date.now();
    const id = setInterval(() => setElapsed(base.current + Math.floor((Date.now() - startedAt.current!) / 1000)), 1000);
    return () => { clearInterval(id); base.current = base.current + Math.floor((Date.now() - startedAt.current!) / 1000); };
  }, [running]);

  const total = unit.est_minutes * 60;
  const remaining = Math.max(0, total - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0"), ss = String(remaining % 60).padStart(2, "0");
  const [pct, setPct] = useState(0);
  useEffect(() => { setPct(Math.min(100, Math.round((elapsed / total) * 100))); }, [elapsed, total]);

  const done = async () => {
    setSaving(true);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    // Review mode = a swapped_review against the *current* plan unit (the return unit borrows its seq).
    const target = mode === "review" ? p.projection.items[0]?.unit ?? unit : unit;
    await ctx.complete({ unit_id: target.id, date: ctx.today, outcome: mode === "review" ? "swapped_review" : "done", minutes, log_text: log.trim() || undefined });
    ctx.go({ name: "today" });
  };

  return (
    <section class="unit">
      <button class="link back" onClick={() => ctx.go({ name: "today" })}>{t.back}</button>
      <p class="eyebrow">{unit.is_checkpoint ? t.checkpoint : `${t.stage} ${unit.stage} · ${t.week} ${unit.week}`}</p>
      <h2 class="unit-title">{unit.title}</h2>

      <div class="timer" role="timer" aria-live="off">
        <div class="timer-ring" style={{ "--pct": `${pct}%` }}><span>{mm}:{ss}</span></div>
        <button class="secondary" onClick={() => setRunning((r) => !r)}>{running ? t.timerStop : t.timerGo}</button>
      </div>

      <Field label={t.learn} text={unit.learn} />
      <Field label={t.do} text={unit.do} />
      <Field label={t.tip} text={unit.tip} />
      <Field label={t.deliverable} text={unit.deliverable} />

      <label class="log">{t.logLabel}
        <textarea rows={3} value={log} onInput={(e) => setLog((e.target as HTMLTextAreaElement).value)} />
      </label>
      <button class="primary" disabled={saving} onClick={done}>{t.done}</button>
    </section>
  );
}
