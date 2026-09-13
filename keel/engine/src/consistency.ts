// Consistency score replaces streaks (Blueprint §3.4). Rolling 28-day window.
// A 2-day miss on a 7-day plan moves 100 → 93, never to zero.

import { addDays, compareDates, countAvailableDays, weekday } from "./dates.ts";
import { doneUnitIds, sessionDates } from "./schedule.ts";
import type { ConsistencyScore, Enrollment, LapseState, LapseTier } from "./types.ts";

export const CONSISTENCY_WINDOW_DAYS = 28;

export function consistency(e: Enrollment, today: string): ConsistencyScore {
  const sessions = sessionDates(e);
  // Today counts as planned only once a session has been logged today —
  // an unfinished day is not a miss.
  const end = sessions.has(today) ? today : addDays(today, -1);
  const rawStart = addDays(end, -(CONSISTENCY_WINDOW_DAYS - 1));
  const start = compareDates(rawStart, e.started_at) < 0 ? e.started_at : rawStart;

  const availableDays = countAvailableDays(start, end, e.availability.days);
  // Rest days deliberately taken (buffer marked done) are not sessions owed.
  const done = doneUnitIds(e);
  const restTaken = e.completions.filter(
    (c) => c.outcome === "done" && compareDates(c.date, start) >= 0 && compareDates(c.date, end) <= 0
      && e.plan.units.some((u) => u.id === c.unit_id && u.is_buffer && done.has(u.id)),
  ).length;
  const planned = Math.max(0, availableDays - restTaken);

  const daySet = new Set(e.availability.days);
  let completed = 0;
  for (const d of sessions) {
    if (compareDates(d, start) >= 0 && compareDates(d, end) <= 0 && daySet.has(weekday(d))) completed++;
  }
  // Working on a non-available day still counts toward the score, capped at planned.
  for (const d of sessions) {
    if (compareDates(d, start) >= 0 && compareDates(d, end) <= 0 && !daySet.has(weekday(d))) completed++;
  }
  completed = Math.min(completed, planned);

  const percent = planned === 0 ? 100 : Math.round((completed / planned) * 100);
  return { planned, completed, percent, window_start: start, window_end: end };
}

export const LAPSE_RETURN_DAYS = 3;
export const LAPSE_REPLAN_DAYS = 7;
export const LAPSE_ARCHIVE_DAYS = 21;

export function lapseTier(missed: number): LapseTier {
  if (missed >= LAPSE_ARCHIVE_DAYS) return "archive_prompt";
  if (missed >= LAPSE_REPLAN_DAYS) return "replan";
  if (missed >= LAPSE_RETURN_DAYS) return "return";
  return "none";
}

/**
 * Consecutive missed *available* days counting back from yesterday. Days the
 * learner never planned to work are skipped, not counted. Stops at the first
 * day with a real session or at started_at. Today is never a miss.
 */
export function lapse(e: Enrollment, today: string): LapseState {
  const sessions = sessionDates(e);
  const daySet = new Set(e.availability.days);
  let missed = 0;
  for (let d = addDays(today, -1); compareDates(d, e.started_at) >= 0; d = addDays(d, -1)) {
    if (!daySet.has(weekday(d))) continue;
    if (sessions.has(d)) break;
    missed++;
  }
  return { consecutive_missed_days: missed, tier: lapseTier(missed) };
}
