// Date-string arithmetic. All functions operate on "YYYY-MM-DD" and use UTC
// internally so local-timezone DST transitions can never shift a day.

import type { Weekday } from "./types.ts";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(s: string): boolean {
  const m = ISO_DATE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function toUtc(s: string): Date {
  if (!isIsoDate(s)) throw new RangeError(`Invalid ISO date: ${s}`);
  const [y, m, d] = s.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(s: string, n: number): string {
  const dt = toUtc(s);
  dt.setUTCDate(dt.getUTCDate() + n);
  return fromUtc(dt);
}

export function weekday(s: string): Weekday {
  return toUtc(s).getUTCDay() as Weekday;
}

/** Signed number of days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b).getTime() - toUtc(a).getTime()) / 86_400_000);
}

export function compareDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Count of calendar days in [from, to] (inclusive) whose weekday is in `days`.
 * Returns 0 if to < from.
 */
export function countAvailableDays(from: string, to: string, days: readonly Weekday[]): number {
  if (compareDates(to, from) < 0) return 0;
  const set = new Set<number>(days);
  let n = 0;
  for (let d = from; compareDates(d, to) <= 0; d = addDays(d, 1)) {
    if (set.has(weekday(d))) n++;
  }
  return n;
}

/** First available date on or after `from`. */
export function nextAvailable(from: string, days: readonly Weekday[]): string {
  const set = new Set<number>(days);
  if (set.size === 0) throw new RangeError("availability.days must be non-empty");
  let d = from;
  for (let i = 0; i < 7; i++) {
    if (set.has(weekday(d))) return d;
    d = addDays(d, 1);
  }
  throw new Error("unreachable");
}
