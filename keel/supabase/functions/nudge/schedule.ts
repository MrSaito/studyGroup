// Pure nudge decision (B5). No I/O: the Edge Function feeds it rows and a clock; tests feed it fixed values.
// Rules (CLAUDE.md B5 + Blueprint §3.5): at the learner's send time if nothing is done today; a second
// one 90 min later offering the 10-minute alternative; never more than two a day; quiet hours respected;
// copy by lapse tier; every notification names the next action and its length.
export interface NudgeInput {
  /** Learner's local wall-clock, minutes since midnight, and local date YYYY-MM-DD. */
  localMinutes: number;
  localDate: string;
  sendAt: string;       // "HH:MM"
  quietStart: string;   // "HH:MM"
  quietEnd: string;     // "HH:MM"
  /** Kinds already sent today. */
  sentToday: Array<"first" | "second">;
  /** True if any done/swapped_review/pushed row is dated localDate. */
  daySpent: boolean;
  /** Learner works today (availability) and has a unit to do. */
  hasUnitToday: boolean;
  lapseTier: "none" | "return" | "replan" | "archive_prompt";
  /** "After dinner", "at your desk" — the implementation intention. */
  intention: { after: string; place: string };
  /** "Day 12 — Dictionaries (45 min)". */
  position: string;
  unitTitle: string;
  unitMinutes: number;
  locale?: string;
}
export type NudgeDecision = { send: false } | { send: true; kind: "first" | "second"; title: string; body: string };

const WINDOW_MIN = 15;   // cron cadence: a decision fires once within its 15-minute window
const SECOND_AFTER_MIN = 90;

export function hm(s: string): number { const [h, m] = s.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); }

export function inQuietHours(localMinutes: number, quietStart: string, quietEnd: string): boolean {
  const a = hm(quietStart), b = hm(quietEnd);
  return a <= b ? localMinutes >= a && localMinutes < b : localMinutes >= a || localMinutes < b; // wraps midnight
}

export function decideNudge(i: NudgeInput): NudgeDecision {
  if (!i.hasUnitToday || i.daySpent) return { send: false };
  if (i.sentToday.length >= 2) return { send: false };
  if (inQuietHours(i.localMinutes, i.quietStart, i.quietEnd)) return { send: false };
  const t = hm(i.sendAt);
  const inWindow = (start: number) => i.localMinutes >= start && i.localMinutes < start + WINDOW_MIN;
  const cue = [i.intention.after, i.intention.place].filter(Boolean).join(", ");
  const T = copy(i.locale ?? "en");
  if (!i.sentToday.includes("first") && inWindow(t)) {
    const title = i.lapseTier === "none" ? (cue || T.title) : T.returnTitle;
    const body = i.lapseTier === "none"
      ? `${i.position.split(" — ")[0]} — ${i.unitTitle} (${i.unitMinutes} ${T.min})`
      : `${T.returnBody} ${i.unitTitle}`;
    return { send: true, kind: "first", title, body };
  }
  if (i.sentToday.includes("first") && !i.sentToday.includes("second") && inWindow(t + SECOND_AFTER_MIN)) {
    return { send: true, kind: "second", title: T.secondTitle, body: `${T.secondBody} ${i.unitTitle}` };
  }
  return { send: false };
}

function copy(locale: string) {
  const en = { title: "Keel", min: "min", returnTitle: "Ten minutes to get back in?", returnBody: "A 10-minute re-entry, then:", secondTitle: "Still here when you are.", secondBody: "10-minute review instead of" };
  const ur = { title: "Keel", min: "منٹ", returnTitle: "واپسی کے لیے دس منٹ؟", returnBody: "10 منٹ کی واپسی، پھر:", secondTitle: "جب آپ تیار ہوں، یہ یہیں ہے۔", secondBody: "اس کے بجائے 10 منٹ کا جائزہ:" };
  return locale === "ur" ? ur : en;
}

/** Local wall clock for an IANA tz at an instant. */
export function localClock(now: Date, tz: string): { localMinutes: number; localDate: string } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "00";
  const hour = Number(get("hour")) % 24;
  return { localMinutes: hour * 60 + Number(get("minute")), localDate: `${get("year")}-${get("month")}-${get("day")}` };
}
