// Weekly review + retrieval quiz (Blueprint §3.6, §5.7 — free tier).
// Rule-based and ungraded: the quiz shows the learner's own log lines from
// units completed at least a week ago and asks them to recall first.
// Selection is seeded so a given week always shows the same items.

import { addDays, daysBetween, weekday } from "./dates.ts";
import type { Enrollment, Unit } from "./types.ts";

export interface QuizItem { unit: Unit; log_text: string; date: string }

export const QUIZ_ITEMS = 3;
export const QUIZ_MIN_AGE_DAYS = 7;

/** Monday on or before `date` — the key a weekly review is stored under. */
export function weekStart(date: string): string {
  return addDays(date, -((weekday(date) + 6) % 7));
}

/** Review prompt days: Friday and Sunday (Blueprint §3.6). */
export function isReviewDay(date: string): boolean {
  const wd = weekday(date);
  return wd === 5 || wd === 0;
}

/** FNV-1a hash of a string → 32-bit seed. */
export function seedFrom(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/** mulberry32: small deterministic PRNG, good enough for shuffling a few items. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Up to `n` retrieval prompts: `done` completions with a log line, at least
 * QUIZ_MIN_AGE_DAYS old, one per unit, buffers excluded. Chosen with a PRNG
 * seeded from the week (stable within a week), returned in plan order.
 */
export function retrievalQuiz(e: Enrollment, today: string, n = QUIZ_ITEMS, seed = seedFrom(weekStart(today))): QuizItem[] {
  const byId = new Map(e.plan.units.map((u) => [u.id, u]));
  const pool: QuizItem[] = [];
  const seen = new Set<string>();
  for (const c of e.completions) {
    const log = c.log_text?.trim();
    if (c.outcome !== "done" || !log) continue;
    if (daysBetween(c.date, today) < QUIZ_MIN_AGE_DAYS) continue;
    const unit = byId.get(c.unit_id);
    if (!unit || unit.is_buffer || seen.has(unit.id)) continue;
    seen.add(unit.id);
    pool.push({ unit, log_text: log, date: c.date });
  }
  const rnd = seededRandom(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, n).sort((a, b) => a.unit.seq - b.unit.seq);
}
