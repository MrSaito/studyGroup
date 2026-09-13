// Markdown → Plan importer (Blueprint §3.1 "importable from Markdown").
//
// Two dialects are accepted and may be mixed:
//
// A. Heading dialect (examples/sample-plan.md):
//    ## Stage 1: … / ### Week 1: … / #### Day 1: Title (45 min) [learn]
//    **Learn:** … / **Do:** … / **Tip:** …
//
// B. Roadmap dialect (the 36-week AI Engineer roadmap):
//    # STAGE 0 — Title (Weeks 1–2)      (H1 with STAGE = stage, not plan title)
//    ## Week 1 — Title
//    **Day 1 — Title (7 h)**            (bold line; "(N h)" or "(N min)")
//    - Learn: … / - Do: … / - Tip: …    (list items)
//    **Day 7 — Rest.**                  (title starting "Rest" = buffer)
//    A first-level heading starting "APPENDIX" ends the plan.
//
// Type inference when no [tag] is given, roadmap dialect: day 5 → review,
// day 6 → build, "Rest" → rest+buffer, title/do containing "build" → build,
// otherwise learn. "exit test" or "checkpoint" in the title → checkpoint.
//
// Format A reference:
//   # Plan Title
//   ## Stage 1: Foundations
//   ### Week 1: Python basics
//   #### Day 1: Variables (45 min) [learn]
//   **Learn:** text or link            (optional)
//   **Do:** the task                   (required)
//   **Tip:** text                      (optional)
//   **Deliverable:** text              (optional)
//   **Checkpoint**                     (flag line, optional)
//   #### Day 5: Buffer [buffer]
//
// Tags in [] after the day title: learn|build|review|rest|buffer|checkpoint.
// Field labels are case-insensitive; the bold markers are optional.
// Minutes default to 45 for work units and 0→15 for rest/buffer.

import type { Plan, Unit, UnitType } from "./types.ts";
import { assertPlan } from "./validate.ts";

const H1 = /^#\s+(.+?)\s*$/;
const H1_STAGE = /^#\s+stage\s*(\d+)\s*[:.\-–—]?\s*(.*?)\s*$/i;
const H1_END = /^#\s+appendix\b/i;
const BOLD_DAY = /^\*\*\s*day\s*(\d+)\s*[:.\-–—]\s*(.+?)\s*\*\*\s*$/i;
const STAGE = /^##\s+(?:stage\s*(\d+)\s*[:.\-–—]?\s*)?(.*?)\s*$/i;
const WEEK = /^###\s+(?:week\s*(\d+)\s*[:.\-–—]?\s*)?(.*?)\s*$/i;
const DAY = /^####\s+(?:day\s*\d+\s*[:.\-–—]?\s*)?(.+?)\s*$/i;
const MINUTES = /\((\d+)\s*(?:min|mins|minutes|m)\)/i;
const HOURS = /\((\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours?)\)/i;
const TAG = /\[([a-z]+)\]/gi;
const FIELD = /^(?:[-*]\s+)?\**\s*(learn|do|tip|deliverable)\s*:?\**\s*:?\s*(.*)$/i;
const CHECKPOINT_LINE = /^\**\s*checkpoint\s*\**\s*$/i;

export const DEFAULT_MINUTES = 45;
/** Roadmap dialect: "Days 1–4 are 1-hour sessions". */
export const DEFAULT_ROADMAP_MINUTES = 60;
export const DEFAULT_REST_MINUTES = 15;

export function slugify(s: string, max = 40): string {
  const slug = s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max).replace(/-+$/g, "");
  return slug || "unit";
}

type Field = "learn" | "do" | "tip" | "deliverable";

interface Draft {
  title: string;
  stage: number;
  week: number;
  type: UnitType;
  est_minutes: number;
  fields: Partial<Record<Field, string[]>>;
  is_checkpoint: boolean;
  is_buffer: boolean;
}

export interface ImportOptions {
  id?: string;
  locale?: string;
  source?: Plan["source"];
}

export function importMarkdown(md: string, opts: ImportOptions = {}): Plan {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  let title = "";
  let stage = 0;
  let stageSeen = false;
  let week = 0;
  const drafts: Draft[] = [];
  let cur: Draft | null = null;
  let curField: Field | null = null;

  const flushField = () => { curField = null; };

  for (const raw of lines) {
    const line = raw.trimEnd();
    let m: RegExpExecArray | null;

    if (H1_END.test(line)) break;
    if ((m = H1_STAGE.exec(line))) { stage = Number(m[1]); stageSeen = true; week = 0; cur = null; flushField(); continue; }
    if ((m = H1.exec(line))) { if (!title) title = m[1]!; cur = null; flushField(); continue; }
    if (/^##\s+week\b/i.test(line)) { // roadmap dialect: "## Week N — title"
      m = /^##\s+week\s*(\d+)/i.exec(line);
      week = m && m[1] ? Number(m[1]) : week + 1;
      if (!stageSeen) { stage = 1; stageSeen = true; }
      cur = null; flushField(); continue;
    }
    if (line.startsWith("## ") && !line.startsWith("###")) {
      m = STAGE.exec(line)!;
      stage = m[1] ? Number(m[1]) : stageSeen ? stage + 1 : 1;
      stageSeen = true;
      week = 0;
      cur = null; flushField(); continue;
    }
    if (line.startsWith("### ") && !line.startsWith("####")) {
      m = WEEK.exec(line)!;
      week = m[1] ? Number(m[1]) : week + 1;
      if (!stageSeen) { stage = 1; stageSeen = true; }
      cur = null; flushField(); continue;
    }
    let dayNum = 0;
    let roadmap = false;
    if ((m = BOLD_DAY.exec(line))) { dayNum = Number(m[1]); roadmap = true; }
    else if ((m = DAY.exec(line))) { const dn = /day\s*(\d+)/i.exec(line); dayNum = dn ? Number(dn[1]) : 0; }
    if (m) {
      if (!stageSeen) { stage = 1; stageSeen = true; }
      if (week === 0) week = 1;
      let dayTitle = roadmap ? m[2]! : m[1]!;
      const minM = MINUTES.exec(dayTitle);
      const hrM = HOURS.exec(dayTitle);
      let minutes = minM ? Number(minM[1]) : hrM ? Math.round(Number(hrM[1]) * 60) : 0;
      dayTitle = dayTitle.replace(MINUTES, "").replace(HOURS, "");
      let type: UnitType = "learn";
      let isBuffer = false;
      let isCheckpoint = false;
      let tagged = false;
      for (const t of dayTitle.matchAll(TAG)) {
        const tag = t[1]!.toLowerCase();
        if (tag === "buffer") { isBuffer = true; type = "rest"; tagged = true; }
        else if (tag === "checkpoint") isCheckpoint = true;
        else if (tag === "learn" || tag === "build" || tag === "review" || tag === "rest") { type = tag; tagged = true; }
      }
      dayTitle = dayTitle.replace(TAG, "").replace(/\s{2,}/g, " ").trim().replace(/[.\s]+$/, "");
      if (!tagged) {
        if (/^(buffer|rest)\b/i.test(dayTitle)) { isBuffer = true; type = "rest"; }
        else if (/\bbuild\b/i.test(dayTitle)) type = "build";
        else if (/\breview\b/i.test(dayTitle) || (roadmap && dayNum === 5)) type = "review";
        else if (roadmap && dayNum === 6) type = "build";
      }
      if (/\b(exit test|checkpoint)\b/i.test(dayTitle)) isCheckpoint = true;
      if (minutes === 0) minutes = type === "rest" ? DEFAULT_REST_MINUTES : roadmap ? DEFAULT_ROADMAP_MINUTES : DEFAULT_MINUTES;
      cur = { title: dayTitle || (isBuffer ? "Buffer" : "Untitled"), stage, week, type, est_minutes: minutes, fields: {}, is_checkpoint: isCheckpoint, is_buffer: isBuffer };
      drafts.push(cur);
      flushField();
      continue;
    }
    if (!cur) continue;
    if (CHECKPOINT_LINE.test(line)) { cur.is_checkpoint = true; flushField(); continue; }
    if ((m = FIELD.exec(line))) {
      curField = m[1]!.toLowerCase() as Field;
      (cur.fields[curField] ??= []).push(m[2]!.trim());
      continue;
    }
    if (curField && line.trim() !== "" && !/^[-*]\s/.test(line)) {
      cur.fields[curField]!.push(line.trim());
      continue;
    }
    if (/^[-*]\s/.test(line)) { flushField(); continue; } // unrelated list item
    if (line.trim() === "") flushField();
  }

  if (!title) throw new Error("Import failed: no '# Title' heading found");
  if (drafts.length === 0) throw new Error("Import failed: no '#### Day …' units found");

  const seenIds = new Map<string, number>();
  const units: Unit[] = drafts.map((d, i) => {
    const base = slugify(d.title);
    const n = (seenIds.get(base) ?? 0) + 1;
    seenIds.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    const join = (f: Field) => d.fields[f]?.join("\n").trim() || undefined;
    const doText = join("do") ?? (d.is_buffer ? "Rest, or catch up if you are behind." : d.type === "rest" ? "Rest." : "");
    const u: Unit = {
      id, seq: i + 1, stage: d.stage, week: d.week, type: d.type, title: d.title,
      est_minutes: d.est_minutes, do: doText, is_checkpoint: d.is_checkpoint, is_buffer: d.is_buffer,
    };
    const learn = join("learn"), tip = join("tip"), deliverable = join("deliverable");
    if (learn) u.learn = learn;
    if (tip) u.tip = tip;
    if (deliverable) u.deliverable = deliverable;
    return u;
  });

  const plan: Plan = {
    schema_version: 1,
    id: opts.id ?? slugify(title, 64),
    title,
    source: opts.source ?? "import",
    version: 1,
    locale: opts.locale ?? "en",
    units,
  };
  return assertPlan(plan);
}
