import { test } from "node:test";
import assert from "node:assert/strict";
import { decideNudge, inQuietHours, localClock, type NudgeInput } from "./schedule.ts";

const base: NudgeInput = {
  localMinutes: 20 * 60, localDate: "2026-09-14", sendAt: "20:00", quietStart: "22:00", quietEnd: "07:00",
  sentToday: [], daySpent: false, hasUnitToday: true, lapseTier: "none",
  intention: { after: "After dinner", place: "at your desk" }, position: "Day 12 of 252 — Stage 1, Week 3", unitTitle: "Dictionaries", unitMinutes: 45,
};

test("first nudge fires in the 15-minute window at the intention time, names the action and its length", () => {
  const d = decideNudge(base);
  assert.deepEqual(d, { send: true, kind: "first", title: "After dinner, at your desk", body: "Day 12 of 252 — Dictionaries (45 min)" });
  assert.equal(decideNudge({ ...base, localMinutes: 20 * 60 + 14 }).send, true);
  assert.equal(decideNudge({ ...base, localMinutes: 20 * 60 + 15 }).send, false, "window closed");
  assert.equal(decideNudge({ ...base, localMinutes: 19 * 60 + 59 }).send, false, "too early");
});

test("no nudge once the day is spent, when there is no unit today, or after two sends", () => {
  assert.equal(decideNudge({ ...base, daySpent: true }).send, false);
  assert.equal(decideNudge({ ...base, hasUnitToday: false }).send, false);
  assert.equal(decideNudge({ ...base, sentToday: ["first", "second"], localMinutes: 21 * 60 + 30 }).send, false);
  assert.equal(decideNudge({ ...base, sentToday: ["first"] }).send, false, "first already sent, not yet second window");
});

test("second nudge 90 minutes later offers the 10-minute alternative, only after the first", () => {
  const d = decideNudge({ ...base, sentToday: ["first"], localMinutes: 21 * 60 + 30 });
  assert.deepEqual(d, { send: true, kind: "second", title: "Still here when you are.", body: "10-minute review instead of Dictionaries" });
  assert.equal(decideNudge({ ...base, sentToday: [], localMinutes: 21 * 60 + 30 }).send, false, "no second without a first");
});

test("quiet hours (wrapping midnight) suppress everything", () => {
  assert.equal(inQuietHours(23 * 60, "22:00", "07:00"), true);
  assert.equal(inQuietHours(6 * 60 + 59, "22:00", "07:00"), true);
  assert.equal(inQuietHours(7 * 60, "22:00", "07:00"), false);
  assert.equal(inQuietHours(13 * 60, "12:00", "14:00"), true);
  assert.equal(decideNudge({ ...base, sendAt: "22:30", localMinutes: 22 * 60 + 30 }).send, false);
});

test("lapse tiers change the copy, never mention missed days, never use the word overdue", () => {
  for (const tier of ["return", "replan", "archive_prompt"] as const) {
    const d = decideNudge({ ...base, lapseTier: tier });
    assert.equal(d.send, true);
    if (d.send) { assert.match(d.title + d.body, /10-minute|Ten minutes/); assert.doesNotMatch(d.title + d.body, /overdue|missed|\bday(s)? (behind|late)/i); }
  }
});

test("localClock resolves Karachi and a DST zone correctly", () => {
  assert.deepEqual(localClock(new Date("2026-09-14T15:05:00Z"), "Asia/Karachi"), { localMinutes: 20 * 60 + 5, localDate: "2026-09-14" });
  assert.deepEqual(localClock(new Date("2026-09-14T23:30:00Z"), "Asia/Karachi"), { localMinutes: 4 * 60 + 30, localDate: "2026-09-15" });
  assert.deepEqual(localClock(new Date("2026-07-01T00:30:00Z"), "Europe/London"), { localMinutes: 90, localDate: "2026-07-01" });
});
