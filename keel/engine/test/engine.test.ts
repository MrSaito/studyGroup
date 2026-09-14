import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  importMarkdown, validatePlan, project, consistency, lapse, buildReturnUnit,
  halveNextTwoWeeks, addDays, countAvailableDays, weekday, unitsExceedingBudget,
  daySpent, weekStart, isReviewDay, retrievalQuiz, seedFrom,
  type Enrollment, type Completion, type Plan, type Weekday,
} from "../src/index.ts";

const md = readFileSync(new URL("../examples/sample-plan.md", import.meta.url), "utf8");
const roadmapMd = readFileSync(new URL("../examples/ai-engineer-36w.md", import.meta.url), "utf8");
const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];
// 2026-09-14 is a Monday.
const MON = "2026-09-14";

function enroll(plan: Plan, days: Weekday[] = ALL_DAYS, completions: Completion[] = []): Enrollment {
  return { plan, started_at: MON, availability: { days, minutes_per_day: 45 }, completions };
}
function doneN(plan: Plan, n: number, from = MON): Completion[] {
  return plan.units.slice(0, n).map((u, i) => ({ unit_id: u.id, date: addDays(from, i), outcome: "done" as const }));
}

// ---------- dates ----------
test("date helpers are DST-proof and weekday-correct", () => {
  assert.equal(weekday(MON), 1);
  assert.equal(addDays("2026-03-28", 2), "2026-03-30"); // EU DST switch weekend
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(countAvailableDays(MON, addDays(MON, 6), WEEKDAYS), 5);
  assert.equal(countAvailableDays(MON, addDays(MON, -1), ALL_DAYS), 0);
});

// ---------- import + validate ----------
test("markdown import produces a valid 10-unit plan with buffers and checkpoint", () => {
  const plan = importMarkdown(md);
  assert.equal(plan.units.length, 10);
  assert.equal(plan.title, "Sample: Two-Week Python Warm-up");
  assert.deepEqual(plan.units.map((u) => u.seq), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(plan.units[4]!.is_buffer, true);
  assert.equal(plan.units[4]!.type, "rest");
  assert.equal(plan.units[8]!.is_checkpoint, true);
  assert.equal(plan.units[2]!.deliverable, "`wordcount.py` committed.");
  assert.equal(plan.units[5]!.stage, 1);
  assert.equal(plan.units[5]!.week, 2);
  const issues = validatePlan(plan);
  assert.equal(issues.filter((i) => i.level === "error").length, 0);
  assert.equal(issues.filter((i) => i.level === "warning").length, 0, JSON.stringify(issues));
});

test("validator catches broken sequence, missing do, >2 learn in a row, >90 min, missing buffer", () => {
  const plan = importMarkdown(md);
  const bad = structuredClone(plan) as any;
  bad.units[1].seq = 5;
  bad.units[2].do = "";
  bad.units[0].est_minutes = 120;
  bad.units[2].type = "learn"; bad.units[3].type = "learn";
  bad.units[4].is_buffer = false; bad.units[4].type = "review";
  const issues = validatePlan(bad);
  const msgs = issues.map((i) => `${i.level}:${i.path}`);
  assert.ok(msgs.includes("error:$.units[1].seq"));
  assert.ok(msgs.includes("error:$.units[2].do"));
  assert.ok(msgs.includes("warning:$.units[0].est_minutes"));
  assert.ok(msgs.some((m) => m.startsWith("warning:$.units[2].type") || m.startsWith("warning:$.units[3].type")));
  assert.ok(issues.some((i) => i.level === "warning" && i.message.includes("1:1 has no buffer slot")));
});

test("import rejects markdown with no title or no units", () => {
  assert.throws(() => importMarkdown("no heading here"));
  assert.throws(() => importMarkdown("# Title only"));
});

// ---------- projection ----------
test("fresh enrollment: today is unit 1, one unit per available day, finish is day 10", () => {
  const e = enroll(importMarkdown(md));
  const p = project(e, MON);
  assert.equal(p.today?.seq, 1);
  assert.equal(p.items.length, 10);
  assert.equal(p.projected_finish, addDays(MON, 9));
  assert.equal(p.deficit_days, 0);
  assert.equal(p.position, "Day 1 of 10 — Stage 1, Week 1");
});

test("weekday-only availability skips weekends in the projection", () => {
  const e = enroll(importMarkdown(md), WEEKDAYS);
  const p = project(e, MON);
  assert.equal(p.items[4]!.date, addDays(MON, 4)); // Fri
  assert.equal(p.items[5]!.date, addDays(MON, 7)); // next Mon
  assert.equal(p.projected_finish, addDays(MON, 11)); // Fri of week 2
});

test("a missed day shifts the sequence by one; nothing stacks; no overdue", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, doneN(plan, 2)); // did Mon, Tue
  // Wed missed. Thu:
  const thu = addDays(MON, 3);
  const p = project(e, thu);
  assert.equal(p.today?.seq, 3, "Thursday shows unit 3, not units 3 and 4");
  assert.equal(p.items[1]!.unit.seq, 4);
  assert.equal(p.items[1]!.date, addDays(thu, 1));
  assert.equal(p.deficit_days, 1);
});

test("one day behind consumes the week's buffer silently; finish date unchanged", () => {
  const plan = importMarkdown(md);
  const onTime = project(enroll(plan), MON).projected_finish;
  const e = enroll(plan, ALL_DAYS, doneN(plan, 2));
  const p = project(e, addDays(MON, 3));
  assert.equal(p.buffers_consumed, 1);
  assert.ok(!p.items.some((i) => i.unit.id === plan.units[4]!.id), "buffer unit 5 removed");
  assert.equal(p.projected_finish, onTime);
});

test("two days behind: first buffer absorbs one, finish slips by exactly one day", () => {
  const plan = importMarkdown(md);
  const onTime = project(enroll(plan), MON).projected_finish!;
  const e = enroll(plan, ALL_DAYS, doneN(plan, 2));
  const p = project(e, addDays(MON, 4)); // missed Wed + Thu
  assert.equal(p.deficit_days, 2);
  assert.equal(p.buffers_consumed, 2, "both buffers consumed");
  assert.equal(p.projected_finish, onTime, "two buffers absorb two missed days");
  const e3 = enroll(plan, ALL_DAYS, doneN(plan, 2));
  const p3 = project(e3, addDays(MON, 5)); // three missed
  assert.equal(p3.projected_finish, addDays(onTime, 1));
});

test("retro-consumed buffer: skipping past an unconsumed buffer does not resurrect it", () => {
  const plan = importMarkdown(md);
  // Learner did units 1-4, missed a day, then did unit 6 directly (buffer 5 never marked).
  const comps = doneN(plan, 4);
  comps.push({ unit_id: plan.units[5]!.id, date: addDays(MON, 5), outcome: "done" });
  const e = enroll(plan, ALL_DAYS, comps);
  const p = project(e, addDays(MON, 6));
  assert.equal(p.today?.seq, 7);
  assert.ok(!p.items.some((i) => i.unit.seq === 5));
  assert.equal(p.deficit_days, 0);
});

test("on-time learner reaches the buffer as a real rest day", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, doneN(plan, 4));
  const p = project(e, addDays(MON, 4));
  assert.equal(p.today?.is_buffer, true);
  assert.equal(p.buffers_consumed, 0);
});

test("after completing today's unit, today is null and next unit is tomorrow", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, doneN(plan, 1));
  const p = project(e, MON);
  assert.equal(p.today, null);
  assert.equal(p.items[0]!.unit.seq, 2);
  assert.equal(p.items[0]!.date, addDays(MON, 1));
});

test("pushed and swapped_review spend the day but do not advance the unit", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, [{ unit_id: plan.units[0]!.id, date: MON, outcome: "pushed" }]);
  const p = project(e, MON);
  assert.equal(p.today, null);
  assert.equal(p.items[0]!.unit.seq, 1);
  assert.equal(p.items[0]!.date, addDays(MON, 1));
  const e2 = enroll(plan, ALL_DAYS, [{ unit_id: plan.units[0]!.id, date: MON, outcome: "swapped_review" }]);
  assert.equal(project(e2, addDays(MON, 1)).today?.seq, 1);
});

test("finished plan: no today, no finish date, position says complete", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, doneN(plan, 10));
  const p = project(e, addDays(MON, 10));
  assert.equal(p.today, null);
  assert.equal(p.items.length, 0);
  assert.equal(p.projected_finish, null);
  assert.match(p.position, /complete/);
});

test("today before started_at throws", () => {
  assert.throws(() => project(enroll(importMarkdown(md)), addDays(MON, -1)), RangeError);
});

test("budget check flags units over 1.5× minutes_per_day", () => {
  const e = enroll(importMarkdown(md));
  e.availability.minutes_per_day = 30;
  assert.deepEqual(unitsExceedingBudget(e).map((u) => u.seq), [3, 8]);
});

// ---------- consistency ----------
test("consistency: 2 misses over 28 planned days → 93%, not zero", () => {
  const plan = importMarkdown(md);
  // Fabricate a 28-day history on a 28-unit-long plan by repeating units.
  const long: Plan = { ...plan, units: Array.from({ length: 30 }, (_, i) => ({ ...plan.units[i % 10]!, id: `u${i + 1}`, seq: i + 1, is_buffer: false, type: "learn" as const })) };
  const comps: Completion[] = [];
  for (let i = 0; i < 28; i++) {
    if (i === 10 || i === 20) continue; // two misses
    comps.push({ unit_id: `u${i + 1}`, date: addDays(MON, i), outcome: "done" });
  }
  const e = enroll(long, ALL_DAYS, comps);
  const s = consistency(e, addDays(MON, 28));
  assert.equal(s.planned, 28);
  assert.equal(s.completed, 26);
  assert.equal(s.percent, 93);
});

test("consistency: fresh enrollment is 100; unfinished today is not a miss", () => {
  const e = enroll(importMarkdown(md));
  assert.equal(consistency(e, MON).percent, 100);
  assert.equal(consistency(e, MON).planned, 0);
});

test("consistency: rest day taken is not a session owed", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, doneN(plan, 5)); // includes buffer as rest on day 5
  const s = consistency(e, addDays(MON, 5));
  assert.equal(s.planned, 4);
  assert.equal(s.completed, 4);
  assert.equal(s.percent, 100);
});

// ---------- lapse ----------
test("lapse tiers at 3 / 7 / 21 missed available days; non-available days are skipped", () => {
  const plan = importMarkdown(md);
  const e = enroll(plan, ALL_DAYS, doneN(plan, 1));
  assert.equal(lapse(e, addDays(MON, 1)).tier, "none");
  assert.equal(lapse(e, addDays(MON, 3)).consecutive_missed_days, 2);
  assert.equal(lapse(e, addDays(MON, 4)).tier, "return");
  assert.equal(lapse(e, addDays(MON, 8)).tier, "replan");
  assert.equal(lapse(e, addDays(MON, 22)).tier, "archive_prompt");
  // Weekday-only learner: Sat/Sun don't count as misses.
  const ew = enroll(plan, WEEKDAYS, doneN(plan, 5)); // Mon–Fri done
  assert.equal(lapse(ew, addDays(MON, 7)).consecutive_missed_days, 0); // next Monday
  assert.equal(lapse(ew, addDays(MON, 10)).consecutive_missed_days, 3); // Thu: Mon,Tue,Wed missed
});

test("lapse never counts today, and a swapped_review resets it", () => {
  const plan = importMarkdown(md);
  const comps = doneN(plan, 1);
  comps.push({ unit_id: plan.units[1]!.id, date: addDays(MON, 4), outcome: "swapped_review" });
  const e = enroll(plan, ALL_DAYS, comps);
  assert.equal(lapse(e, addDays(MON, 5)).consecutive_missed_days, 0);
});

// ---------- recovery ----------
test("Return unit is 10 minutes, recaps last completed logs, targets current unit, and never mentions missed days", () => {
  const plan = importMarkdown(md);
  const comps = doneN(plan, 3);
  comps[2]!.log_text = "Counter uses collections.Counter";
  const e = enroll(plan, ALL_DAYS, comps);
  const r = buildReturnUnit(e);
  assert.equal(r.est_minutes, 10);
  assert.equal(r.type, "review");
  assert.equal(r.seq, 4);
  assert.match(r.learn!, /collections\.Counter/);
  assert.match(r.do, /Build a word counter/);
  assert.doesNotMatch(`${r.title} ${r.learn} ${r.do} ${r.tip}`, /miss|overdue|behind/i);
  const ur = buildReturnUnit(e, "ur");
  assert.match(ur.title, /واپسی/);
});

test("Return unit on a plan with no completions is a fresh-start unit", () => {
  const r = buildReturnUnit(enroll(importMarkdown(md)));
  assert.equal(r.seq, 1);
  assert.match(r.learn!, /fresh start/);
});

test("halveNextTwoWeeks halves only the next two weeks from the current unit, bumps version, floors at 10 min", () => {
  const plan = importMarkdown(md);
  const p2 = halveNextTwoWeeks(plan, 3);
  assert.equal(p2.version, 2);
  assert.equal(plan.version, 1, "original untouched");
  assert.equal(p2.units[0]!.est_minutes, 40, "before fromSeq unchanged");
  assert.equal(p2.units[2]!.est_minutes, 30);
  assert.equal(p2.units[3]!.est_minutes, 15);
  assert.equal(p2.units[4]!.est_minutes, 15, "buffer unchanged");
  assert.match(p2.units[5]!.do, /^\(Half-size week\)/);
  assert.equal(validatePlan(p2).filter((i) => i.level === "error").length, 0);
});

// ---------- JSON schema round-trip ----------
test("imported plan serialises to JSON matching plan.schema.json required keys", () => {
  const schema = JSON.parse(readFileSync(new URL("../plan.schema.json", import.meta.url), "utf8"));
  const plan = JSON.parse(JSON.stringify(importMarkdown(md)));
  for (const k of schema.required) assert.ok(k in plan, `missing ${k}`);
  for (const u of plan.units) for (const k of schema.properties.units.items.required) assert.ok(k in u, `unit missing ${k}`);
  const allowed = new Set(Object.keys(schema.properties.units.items.properties));
  for (const u of plan.units) for (const k of Object.keys(u)) assert.ok(allowed.has(k), `unit has unknown key ${k}`);
});

// ---------- roadmap dialect (A8: the real 36-week AI Engineer plan) ----------
test("roadmap dialect: 36 weeks × 7 days → 252 units, stages 0–6, appendices excluded, 0 errors", () => {
  const plan = importMarkdown(roadmapMd, { id: "ai-engineer-36w", source: "template" });
  assert.equal(plan.id, "ai-engineer-36w");
  assert.equal(plan.source, "template");
  assert.equal(plan.units.length, 252);
  assert.deepEqual(plan.units.map((u) => u.seq), plan.units.map((_, i) => i + 1));
  assert.deepEqual([...new Set(plan.units.map((u) => u.stage))], [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual([...new Set(plan.units.map((u) => u.week))], Array.from({ length: 36 }, (_, i) => i + 1));
  for (let w = 1; w <= 36; w++) assert.equal(plan.units.filter((u) => u.week === w).length, 7, `week ${w}`);
  assert.ok(plan.units.every((u) => u.do.length > 0));
  assert.ok(!plan.units.some((u) => /appendix/i.test(u.title)));
  assert.equal(validatePlan(plan).filter((i) => i.level === "error").length, 0);
});

test("roadmap dialect: day 1–4 learn 60 min, day 5 review, day 6 build 7 h, day 7 rest buffer; exit tests are checkpoints", () => {
  const plan = importMarkdown(roadmapMd);
  const week1 = plan.units.filter((u) => u.week === 1);
  assert.deepEqual(week1.map((u) => u.type), ["learn", "learn", "learn", "learn", "review", "build", "rest"]);
  assert.deepEqual(week1.map((u) => u.est_minutes), [60, 60, 60, 60, 60, 420, 15]);
  assert.equal(week1[0]!.title, "Set up the machine");
  assert.equal(week1[0]!.learn, "what an operating system is; why developers use Linux/Unix shells.");
  assert.ok(week1[0]!.tip!.startsWith("spend the whole hour on setup"));
  const buffers = plan.units.filter((u) => u.is_buffer);
  assert.equal(buffers.length, 36);
  assert.ok(buffers.every((u) => u.type === "rest" && u.title.startsWith("Rest")));
  const checkpoints = plan.units.filter((u) => u.is_checkpoint);
  assert.deepEqual(checkpoints.map((u) => u.week), [2, 9, 13, 19, 25]);
  assert.ok(checkpoints.every((u) => u.type === "build" && /exit test/i.test(u.title)));
  // Warnings are content facts of this roadmap (4 learn days in a row, 7-hour
  // build blocks), never blockers. Pinned so a validator change is noticed.
  const warnings = validatePlan(plan).filter((i) => i.level === "warning");
  assert.equal(warnings.length, 106);
  assert.ok(warnings.every((w) => /learn units in a row|exceeds 90/.test(w.message)));
});

test("roadmap import is deterministic and matches the committed plans/ai-engineer-36w.json", () => {
  const plan = importMarkdown(roadmapMd, { id: "ai-engineer-36w", source: "template" });
  const committed = JSON.parse(readFileSync(new URL("../../plans/ai-engineer-36w.json", import.meta.url), "utf8"));
  assert.deepEqual(plan, committed);
  // Seven-day availability: one unit per day, rest units served as rest days → 252 calendar days.
  const p = project(enroll(plan), MON);
  assert.equal(p.today?.title, "Set up the machine");
  assert.equal(p.position, "Day 1 of 252 — Stage 0, Week 1");
  assert.equal(p.projected_finish, addDays(MON, 251));
});

// ---------- skipped outcome (A4) ----------
test("skipped: unit advances and is never served again; not a session; does not spend the day", () => {
  const plan = importMarkdown(md);
  const u1 = plan.units[0]!, u2 = plan.units[1]!;
  const e = enroll(plan, ALL_DAYS, [{ unit_id: u1.id, date: MON, outcome: "skipped", log_text: "already know this" }]);
  const p = project(e, MON);
  assert.equal(p.today?.id, u2.id, "today moves to the next unit");
  assert.equal(daySpent(e, MON), false);
  assert.ok(!p.items.some((i) => i.unit.id === u1.id));
  assert.equal(p.position, "Day 2 of 10 — Stage 1, Week 1");
  assert.equal(p.projected_finish, addDays(MON, 8), "one fewer unit → finish one day earlier");
  // Not a session: consistency and lapse ignore it.
  const later = addDays(MON, 4);
  const eLater = enroll(plan, ALL_DAYS, [{ unit_id: u1.id, date: addDays(MON, 3), outcome: "skipped" }]);
  assert.equal(lapse(eLater, later).consecutive_missed_days, 4);
  assert.equal(consistency(eLater, later).completed, 0);
  // Return unit targets the first non-skipped unit.
  assert.equal(buildReturnUnit(eLater).id, `return-${u2.id}`);
});

// ---------- weekly review + retrieval quiz (A3) ----------
test("weekStart is the Monday on or before; review days are Friday and Sunday", () => {
  assert.equal(weekStart(MON), MON);
  assert.equal(weekStart(addDays(MON, 6)), MON); // Sunday belongs to the week that started Monday
  assert.equal(weekStart(addDays(MON, 7)), addDays(MON, 7));
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((i) => isReviewDay(addDays(MON, i))), [false, false, false, false, true, false, true]);
});

test("retrievalQuiz: only done units with a log ≥7 days old, one per unit, no buffers, ≤3, deterministic per week, in plan order", () => {
  const plan = importMarkdown(md);
  const comps: Completion[] = plan.units.map((u, i) => ({ unit_id: u.id, date: addDays(MON, i), outcome: "done" as const, log_text: `note ${i + 1}` }));
  comps[2] = { ...comps[2]!, log_text: "   " };               // no usable log
  comps.push({ unit_id: plan.units[0]!.id, date: addDays(MON, 12), outcome: "done", log_text: "again" }); // duplicate unit
  const today = addDays(MON, 14);
  const e = enroll(plan, ALL_DAYS, comps);
  const q = retrievalQuiz(e, today);
  assert.equal(q.length, 3);
  assert.deepEqual(q.map((i) => i.unit.seq), [...q.map((i) => i.unit.seq)].sort((a, b) => a - b));
  for (const item of q) {
    assert.ok(!item.unit.is_buffer);
    assert.ok(item.log_text.trim().length > 0);
    assert.ok(addDays(item.date, 7) <= today, `${item.date} is too recent`);
  }
  assert.ok(!q.some((i) => i.unit.seq === 3), "unit with blank log excluded");
  assert.deepEqual(retrievalQuiz(e, today), q, "same inputs → same quiz");
  assert.deepEqual(retrievalQuiz(e, today, 3, seedFrom(weekStart(today))), q, "default seed is the week's Monday");
  // Later in the same week the pool can grow (more logs cross the 7-day line); the seed stays the same.
  assert.equal(seedFrom(weekStart(addDays(today, 3))), seedFrom(weekStart(today)));
  assert.notDeepEqual(retrievalQuiz(e, today, 3, seedFrom("other")), q, "different seed → different draw");
  assert.equal(retrievalQuiz(enroll(plan, ALL_DAYS, comps), addDays(MON, 2)).length, 0, "nothing old enough yet");
});

// ---------- multi-unit days (session 6) ----------
test("multi-unit day: a second done row dated today advances again, finish moves a day earlier, still one session-day", () => {
  const plan = importMarkdown(md);
  const [u1, u2, u3] = [plan.units[0]!, plan.units[1]!, plan.units[2]!];
  const e = enroll(plan, ALL_DAYS, [
    { unit_id: u1.id, date: MON, outcome: "done", minutes: 40 },
    { unit_id: u2.id, date: MON, outcome: "done", minutes: 45 },
  ]);
  const p = project(e, MON);
  assert.equal(p.today, null, "the day is spent");
  assert.equal(p.items[0]!.unit.id, u3.id, "next unit is the third");
  assert.equal(p.items[0]!.date, addDays(MON, 1));
  assert.equal(p.projected_finish, addDays(MON, 8), "baseline finish is day 10 (MON+9); one extra unit today → MON+8");
  assert.equal(p.position, "Day 3 of 10 — Stage 1, Week 1");
  const c = consistency(e, MON);
  assert.equal(c.completed, 1, "consistency counts days with a session, not units");
  assert.equal(c.percent, 100);
  assert.equal(lapse(e, addDays(MON, 1)).consecutive_missed_days, 0);
  // Return unit locales: every table has the same keys (drafts included).
  for (const l of ["en", "ur", "ar", "zh", "ru", "es"]) assert.ok(buildReturnUnit(e, l).title.length > 0, l);
});
