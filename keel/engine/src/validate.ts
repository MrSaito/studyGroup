// Plan validation. Errors block import; warnings surface to the plan author.
// Zero-dependency on purpose (runs on-device inside the PWA). The JSON Schema
// in plan.schema.json is the interchange contract; this is its runtime twin.

import type { Plan, Unit, UnitType, ValidationIssue } from "./types.ts";

const UNIT_TYPES: readonly UnitType[] = ["learn", "build", "review", "rest"];
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** Blueprint §11.2: the coach should flag units over 90 minutes. */
export const MAX_UNIT_MINUTES = 90;
/** Blueprint §3.6: no more than two `learn` units in a row. */
export const MAX_CONSECUTIVE_LEARN = 2;

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
function optStr(x: unknown): boolean {
  return x === undefined || typeof x === "string";
}

export function validatePlan(input: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (path: string, message: string) => issues.push({ level: "error", path, message });
  const warn = (path: string, message: string) => issues.push({ level: "warning", path, message });

  if (!isObj(input)) return [{ level: "error", path: "$", message: "plan must be an object" }];
  if (input.schema_version !== 1) err("$.schema_version", "must be 1");
  if (typeof input.id !== "string" || !SLUG.test(input.id)) err("$.id", "must be a slug (a-z, 0-9, -)");
  if (typeof input.title !== "string" || input.title.trim() === "") err("$.title", "required");
  if (!["template", "import", "coach"].includes(input.source as string)) err("$.source", "must be template|import|coach");
  if (!Number.isInteger(input.version) || (input.version as number) < 1) err("$.version", "must be integer >= 1");
  if (typeof input.locale !== "string" || !/^[a-z]{2}(-[A-Z]{2})?$/.test(input.locale)) err("$.locale", "must be a BCP-47 tag like en or ur");
  if (!Array.isArray(input.units) || input.units.length === 0) {
    err("$.units", "must be a non-empty array");
    return issues;
  }

  const ids = new Set<string>();
  let consecutiveLearn = 0;
  let lastStage = 0;
  let lastWeek = 0;
  const weeksWithBuffer = new Set<string>();
  const weeksSeen = new Set<string>();

  (input.units as unknown[]).forEach((u, i) => {
    const p = `$.units[${i}]`;
    if (!isObj(u)) return err(p, "must be an object");
    if (typeof u.id !== "string" || !SLUG.test(u.id)) err(`${p}.id`, "must be a slug");
    else if (ids.has(u.id)) err(`${p}.id`, `duplicate id ${u.id}`);
    else ids.add(u.id);
    if (u.seq !== i + 1) err(`${p}.seq`, `must be ${i + 1} (contiguous, 1-based)`);
    if (!Number.isInteger(u.stage) || (u.stage as number) < 0) err(`${p}.stage`, "integer >= 0");
    if (!Number.isInteger(u.week) || (u.week as number) < 1) err(`${p}.week`, "integer >= 1");
    if (!UNIT_TYPES.includes(u.type as UnitType)) err(`${p}.type`, `must be one of ${UNIT_TYPES.join("|")}`);
    if (typeof u.title !== "string" || u.title.trim() === "") err(`${p}.title`, "required");
    if (!Number.isInteger(u.est_minutes) || (u.est_minutes as number) < 1) err(`${p}.est_minutes`, "integer >= 1");
    else if ((u.est_minutes as number) > MAX_UNIT_MINUTES) warn(`${p}.est_minutes`, `${u.est_minutes} min exceeds ${MAX_UNIT_MINUTES}; oversized units kill motivation (Blueprint §11.2)`);
    if (typeof u.do !== "string" || u.do.trim() === "") err(`${p}.do`, "required — every unit needs a concrete task");
    if (!optStr(u.learn)) err(`${p}.learn`, "must be a string");
    if (!optStr(u.tip)) err(`${p}.tip`, "must be a string");
    if (!optStr(u.deliverable)) err(`${p}.deliverable`, "must be a string");
    if (typeof u.is_checkpoint !== "boolean") err(`${p}.is_checkpoint`, "boolean required");
    if (typeof u.is_buffer !== "boolean") err(`${p}.is_buffer`, "boolean required");
    if (u.is_buffer === true && u.type !== "rest") err(`${p}.type`, "buffer units must be type=rest");

    // Sequence monotonicity
    const stage = Number(u.stage), week = Number(u.week);
    if (Number.isInteger(stage) && Number.isInteger(week)) {
      if (stage < lastStage || (stage === lastStage && week < lastWeek)) err(`${p}`, "stage/week must be non-decreasing along seq");
      lastStage = stage; lastWeek = week;
      const key = `${stage}:${week}`;
      weeksSeen.add(key);
      if (u.is_buffer === true) weeksWithBuffer.add(key);
    }

    // Variety rule (Blueprint §3.6)
    if (u.type === "learn") {
      consecutiveLearn++;
      if (consecutiveLearn > MAX_CONSECUTIVE_LEARN) warn(`${p}.type`, `${consecutiveLearn} learn units in a row; insert a build or review unit`);
    } else consecutiveLearn = 0;
  });

  for (const key of weeksSeen) {
    if (!weeksWithBuffer.has(key)) warn(`$.units`, `stage/week ${key} has no buffer slot; lapses in this week will push the finish date immediately`);
  }
  return issues;
}

/** Throws on the first error; returns the typed plan otherwise. */
export function assertPlan(input: unknown): Plan {
  const errors = validatePlan(input).filter((i) => i.level === "error");
  if (errors.length) {
    const first = errors[0]!;
    throw new Error(`Invalid plan: ${first.path} ${first.message} (${errors.length} error(s))`);
  }
  return input as Plan;
}

export function unitBySeq(plan: Plan, seq: number): Unit | undefined {
  return plan.units[seq - 1];
}
