// Elastic scheduling (Blueprint §3.3). The schedule is a projection computed
// from sequence + availability + completions. There is no "overdue" state:
// a missed day shifts everything by one; buffers absorb deficit silently.
//
// Completion semantics (settled here, referenced by the app):
//   done            → unit advances; counts as a session.
//   swapped_review  → unit does NOT advance (learner did a 10-min review
//                     instead); counts as a session for consistency.
//   pushed          → nothing advances; not a session; today is spent.
//   skipped         → unit advances (Plan screen, with a reason); not a
//                     session; the day is NOT spent (A4, session 5).

import { addDays, compareDates, countAvailableDays, nextAvailable } from "./dates.ts";
import type { Enrollment, Projection, ProjectedUnit, Unit } from "./types.ts";

export function doneUnitIds(e: Enrollment): Set<string> {
  const s = new Set<string>();
  for (const c of e.completions) if (c.outcome === "done") s.add(c.unit_id);
  return s;
}

export function skippedUnitIds(e: Enrollment): Set<string> {
  const s = new Set<string>();
  for (const c of e.completions) if (c.outcome === "skipped") s.add(c.unit_id);
  return s;
}

/** Units the sequence has moved past: done or skipped. */
export function advancedUnitIds(e: Enrollment): Set<string> {
  const s = doneUnitIds(e);
  for (const id of skippedUnitIds(e)) s.add(id);
  return s;
}

/** A done / swapped_review / pushed row dated `date` means that day is spent. A skip never spends a day. */
export function daySpent(e: Enrollment, date: string): boolean {
  return e.completions.some((c) => c.date === date && c.outcome !== "skipped");
}

/** Days on which a real session happened (done or swapped_review). */
export function sessionDates(e: Enrollment): Set<string> {
  const s = new Set<string>();
  for (const c of e.completions) if (c.outcome === "done" || c.outcome === "swapped_review") s.add(c.date);
  return s;
}

export function positionString(unit: Unit, total: number): string {
  return `Day ${unit.seq} of ${total} — Stage ${unit.stage}, Week ${unit.week}`;
}

export function project(e: Enrollment, today: string): Projection {
  if (compareDates(today, e.started_at) < 0) {
    throw new RangeError(`today (${today}) is before started_at (${e.started_at})`);
  }
  const units = e.plan.units;
  const done = doneUnitIds(e);
  const advanced = advancedUnitIds(e);

  // Elapsed sessions the learner *could* have done: available days in [start, yesterday].
  const elapsed = countAvailableDays(e.started_at, addDays(today, -1), e.availability.days);
  const doneNonBuffer = units.filter((u) => !u.is_buffer && done.has(u.id)).length;
  const restTaken = units.filter((u) => u.is_buffer && done.has(u.id)).length;

  // A buffer the learner has already moved past (a later non-buffer unit is
  // done) and never marked as a rest day was consumed by an earlier deficit.
  const maxDoneSeq = units.reduce((m, u) => (!u.is_buffer && done.has(u.id) && u.seq > m ? u.seq : m), 0);
  const retroConsumed = (u: Unit) => u.is_buffer && !done.has(u.id) && u.seq < maxDoneSeq;
  const pastConsumed = units.filter(retroConsumed).length;

  let deficit = Math.max(0, elapsed - doneNonBuffer - restTaken - pastConsumed);
  const deficitDays = deficit;
  let buffersConsumed = 0;

  const items: ProjectedUnit[] = [];
  let cursor = daySpent(e, today) ? nextAvailable(addDays(today, 1), e.availability.days) : nextAvailable(today, e.availability.days);

  for (const u of units) {
    if (advanced.has(u.id)) continue;
    if (u.is_buffer) {
      if (retroConsumed(u)) continue;
      if (deficit > 0) { deficit--; buffersConsumed++; continue; }
    }
    items.push({ unit: u, date: cursor });
    cursor = nextAvailable(addDays(cursor, 1), e.availability.days);
  }

  const first = items[0];
  const todayUnit = first && first.date === today ? first.unit : null;
  const last = items[items.length - 1];

  return {
    items,
    today: todayUnit,
    projected_finish: last ? last.date : null,
    deficit_days: deficitDays,
    buffers_consumed: buffersConsumed,
    position: first ? positionString(first.unit, units.length) : `Day ${units.length} of ${units.length} — complete`,
  };
}

/**
 * Availability sanity: a unit that needs more than 1.5× the daily budget
 * will not fit in one session. Returned for the onboarding step to warn.
 */
export function unitsExceedingBudget(e: Enrollment, factor = 1.5): Unit[] {
  const cap = e.availability.minutes_per_day * factor;
  return e.plan.units.filter((u) => !u.is_buffer && u.est_minutes > cap);
}
