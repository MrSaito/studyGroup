import { useEffect, useRef, useState } from "preact/hooks";
import type { Projection, Unit } from "@keel/engine";
import { store, type TimerState } from "../store.ts";
import type { Ctx } from "../app.tsx";
import { track } from "../events.ts";

function isUrl(s: string): boolean { return /^https?:\/\/\S+$/.test(s.trim()); }

export function Field(p: { label: string; text?: string }) {
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

// Timer (A2): elapsed = base + (now − started_at). Nothing depends on the
// interval having fired — a backgrounded or frozen tab catches up on the next
// tick or on visibilitychange, and the state lives in IndexedDB so a reload
// mid-session resumes with the right time and the draft log intact.
export function UnitScreen(p: { ctx: Ctx; unit: Unit; mode: "plan" | "review"; projection: Projection }) {
  const { ctx, unit, mode } = p;
  const { t } = ctx;
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const logFlush = useRef<number | null>(null);
  const logRef = useRef("");   // latest typed value, readable synchronously by Done (state may lag a render)

  useEffect(() => {
    let alive = true;
    store.getTimer().then((saved) => {
      if (!alive) return;
      setNow(Date.now());
      const next = saved && saved.unit_id === unit.id ? saved : { unit_id: unit.id, started_at: null, base: 0, log: "" };
      logRef.current = next.log;
      setTimer(next);
    }).catch(() => setTimer({ unit_id: unit.id, started_at: null, base: 0, log: "" }));
    return () => { alive = false; };
  }, [unit.id]);

  const running = timer?.started_at != null;
  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    let id: number | null = window.setInterval(tick, 1000);
    const onVis = () => {
      tick();
      if (id != null) { clearInterval(id); id = null; }
      if (document.visibilityState === "visible") id = window.setInterval(tick, 1000);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => { if (id != null) clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [running]);

  const persist = (next: TimerState) => { setTimer(next); store.putTimer(next).catch(() => {}); };
  const elapsed = timer ? timer.base + (timer.started_at != null ? Math.max(0, Math.floor((now - timer.started_at) / 1000)) : 0) : 0;
  const toggle = () => {
    if (!timer) return;
    const at = Date.now();
    setNow(at);
    persist(running
      ? { ...timer, started_at: null, base: timer.base + Math.max(0, Math.floor((at - timer.started_at!) / 1000)) }
      : { ...timer, started_at: at });
  };
  const onLog = (value: string) => {
    if (!timer) return;
    const next = { ...timer, log: value };
    logRef.current = value;
    setTimer(next);
    if (logFlush.current != null) clearTimeout(logFlush.current);
    logFlush.current = window.setTimeout(() => { store.putTimer(next).catch(() => {}); }, 300);
  };

  const total = unit.est_minutes * 60;
  const remaining = Math.max(0, total - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0"), ss = String(remaining % 60).padStart(2, "0");
  const pct = Math.min(100, Math.round((elapsed / total) * 100));

  // Unmount must not leave a debounced log write pending: it could land after Done cleared the timer.
  useEffect(() => () => { if (logFlush.current != null) clearTimeout(logFlush.current); }, []);

  const done = async () => {
    setSaving(true);
    if (logFlush.current != null) { clearTimeout(logFlush.current); logFlush.current = null; }
    const minutes = Math.max(1, Math.round(elapsed / 60));
    // Review mode = a swapped_review against the *current* plan unit (the return unit borrows its seq).
    const target = mode === "review" ? p.projection.items[0]?.unit ?? unit : unit;
    const log = logRef.current.trim() || undefined;
    await ctx.complete({ unit_id: target.id, date: ctx.today, outcome: mode === "review" ? "swapped_review" : "done", minutes, log_text: log });
    if (mode === "review") track("return_done", { unit_id: target.id, minutes });
    await store.clearTimer().catch(() => {});
    ctx.go({ name: "today" });
  };

  return (
    <section class="unit">
      <button class="link back" onClick={() => ctx.go({ name: "today" })}>{t.back}</button>
      <p class="eyebrow">{unit.is_checkpoint ? t.checkpoint : `${t.stage} ${unit.stage} · ${t.week} ${unit.week}`}</p>
      <h2 class="unit-title">{unit.title}</h2>

      <div class="timer" role="timer" aria-live="off">
        <div class="timer-ring" style={{ "--pct": `${pct}%` }}><span>{mm}:{ss}</span></div>
        <button class="secondary" disabled={!timer} aria-pressed={running} onClick={toggle}>{running ? t.timerStop : t.timerGo}</button>
      </div>

      <Field label={t.learn} text={unit.learn} />
      <Field label={t.do} text={unit.do} />
      <Field label={t.tip} text={unit.tip} />
      <Field label={t.deliverable} text={unit.deliverable} />

      <label class="log">{t.logLabel}
        <textarea rows={3} value={timer?.log ?? ""} onInput={(e) => onLog((e.target as HTMLTextAreaElement).value)} />
      </label>
      <button class="primary" disabled={saving || !timer} onClick={done}>{t.done}</button>
    </section>
  );
}
