// Lapse recovery (Blueprint §3.4). Free tier: Return units are templated,
// not AI-generated. Re-plan shrinks the next two weeks to half-size units.
// Copy rule: forgiveness by default; shortest path to Start. No miss counts.

import { advancedUnitIds } from "./schedule.ts";
import type { Completion, Enrollment, Plan, Unit } from "./types.ts";

export const RETURN_UNIT_MINUTES = 10;

/** Last N units marked done, most recent first, with their log text if any. */
export function recentlyCompleted(e: Enrollment, n = 3): Array<{ unit: Unit; completion: Completion }> {
  const byId = new Map(e.plan.units.map((u) => [u.id, u]));
  const out: Array<{ unit: Unit; completion: Completion }> = [];
  const seen = new Set<string>();
  for (let i = e.completions.length - 1; i >= 0 && out.length < n; i--) {
    const c = e.completions[i]!;
    if (c.outcome !== "done" || seen.has(c.unit_id)) continue;
    const unit = byId.get(c.unit_id);
    if (!unit || unit.is_buffer) continue;
    seen.add(c.unit_id);
    out.push({ unit, completion: c });
  }
  return out;
}

/**
 * Build the 10-minute re-entry unit. It is *not* part of the plan sequence;
 * completing it is recorded as a session (outcome=swapped_review against the
 * current unit) so consistency recovers and the plan resumes where it was.
 */
export function buildReturnUnit(e: Enrollment, locale = "en"): Unit {
  const recent = recentlyCompleted(e, 3);
  const advanced = advancedUnitIds(e);
  const current = e.plan.units.find((u) => !u.is_buffer && !advanced.has(u.id)) ?? e.plan.units[e.plan.units.length - 1]!;
  const t = STRINGS[locale] ?? STRINGS.en!;

  const recap = recent.length
    ? recent.map(({ unit, completion }) => {
        const log = completion.log_text?.trim();
        return log ? `${unit.title} — ${t.youWrote} "${log}"` : unit.title;
      }).join("\n")
    : t.noHistory;

  return {
    id: `return-${current.id}`,
    seq: current.seq,
    stage: current.stage,
    week: current.week,
    type: "review",
    title: `${t.returnTitle}: ${current.title}`,
    est_minutes: RETURN_UNIT_MINUTES,
    learn: recap,
    do: recent.length ? `${t.doRecent} ${recent[0]!.unit.title}. ${t.thenNext} ${current.title}.` : t.doFirst,
    tip: t.tip,
    is_checkpoint: false,
    is_buffer: false,
  };
}

/**
 * Re-plan option A: halve the next two calendar weeks of the plan (by
 * stage/week keys from the current unit onward). Returns a new plan with
 * version+1; the original is untouched. Minimum 10 minutes per unit.
 */
export function halveNextTwoWeeks(plan: Plan, fromSeq: number, locale = "en"): Plan {
  const t: Strings = STRINGS[locale] ?? STRINGS.en!;
  const weekKeys: string[] = [];
  for (const u of plan.units) {
    if (u.seq < fromSeq) continue;
    const k = `${u.stage}:${u.week}`;
    if (!weekKeys.includes(k)) weekKeys.push(k);
    if (weekKeys.length === 2) break;
  }
  const target = new Set(weekKeys);
  const units = plan.units.map((u) => {
    if (u.seq < fromSeq || u.is_buffer || !target.has(`${u.stage}:${u.week}`)) return u;
    return {
      ...u,
      est_minutes: Math.max(10, Math.ceil(u.est_minutes / 2)),
      do: `${t.halfSize} ${u.do}`,
    };
  });
  return { ...plan, version: plan.version + 1, units };
}

// i18n from day one (PATTERNS §7). Urdu strings are placeholders to be
// reviewed by a native speaker before ship; they are marked in HANDOVER.md.
type Strings = { returnTitle: string; youWrote: string; noHistory: string; doRecent: string; thenNext: string; doFirst: string; tip: string; halfSize: string };
const STRINGS: Record<string, Strings> = {
  en: {
    returnTitle: "Re-entry",
    youWrote: "you wrote:",
    noHistory: "You haven't completed a unit yet — this is a fresh start.",
    doRecent: "Re-read your notes above and redo one small piece of",
    thenNext: "Then you're ready for",
    doFirst: "Open the first unit and do its first step only.",
    tip: "Ten minutes is the whole task. Stop when the timer stops.",
    halfSize: "(Half-size week)",
  },
  ur: {
    returnTitle: "واپسی",
    youWrote: "آپ نے لکھا:",
    noHistory: "آپ نے ابھی کوئی یونٹ مکمل نہیں کیا — یہ ایک نئی شروعات ہے۔",
    doRecent: "اوپر اپنے نوٹس دوبارہ پڑھیں اور ایک چھوٹا حصہ دہرائیں:",
    thenNext: "پھر آپ تیار ہیں:",
    doFirst: "پہلا یونٹ کھولیں اور صرف اس کا پہلا قدم کریں۔",
    tip: "دس منٹ ہی پورا کام ہے۔ ٹائمر رکے تو رک جائیں۔",
    halfSize: "(آدھا ہفتہ)",
  },
};
