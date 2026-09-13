// Keel engine — core types. Mirrors Blueprint §3.1 (units) and §7 (data model).
// Dates are ISO calendar strings ("YYYY-MM-DD") in the user's local timezone.
// The engine is pure: no clocks, no I/O. Callers pass `today`.

export type UnitType = "learn" | "build" | "review" | "rest";

export interface Unit {
  /** Stable id within the plan (slug). */
  id: string;
  /** 1-based position in the plan sequence. Must be contiguous. */
  seq: number;
  /** 0-based allowed: the AI Engineer roadmap starts at Stage 0. */
  stage: number;
  week: number;
  type: UnitType;
  title: string;
  est_minutes: number;
  learn?: string;
  do: string;
  tip?: string;
  deliverable?: string;
  is_checkpoint: boolean;
  /**
   * Buffer slot (Blueprint §3.3). A buffer is consumed silently when the
   * learner is behind; otherwise it is served as a `rest` day. Buffers are
   * never counted as "planned sessions" for the consistency score.
   */
  is_buffer: boolean;
}

export interface Plan {
  schema_version: 1;
  id: string;
  title: string;
  source: "template" | "import" | "coach";
  version: number;
  locale: string;
  units: Unit[];
}

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface Availability {
  /** Weekdays the learner intends to work. Non-empty. */
  days: Weekday[];
  minutes_per_day: number;
}

export type CompletionOutcome = "done" | "swapped_review" | "pushed";

/** Append-only record (Blueprint §7 `completions`). */
export interface Completion {
  unit_id: string;
  /** Local calendar date of completion. */
  date: string;
  outcome: CompletionOutcome;
  minutes?: number;
  log_text?: string;
}

export interface Enrollment {
  plan: Plan;
  /** Local calendar date the learner started. */
  started_at: string;
  availability: Availability;
  completions: Completion[];
}

export interface ProjectedUnit {
  unit: Unit;
  date: string;
}

export interface Projection {
  /** Units still to do, in sequence, with their projected dates. */
  items: ProjectedUnit[];
  /** The unit shown on the Today card, or null if the plan is finished. */
  today: Unit | null;
  projected_finish: string | null;
  /** Available days elapsed minus sessions completed (>= 0). */
  deficit_days: number;
  /** Buffer units silently consumed by this projection. */
  buffers_consumed: number;
  /** Position string for the Done animation, e.g. "Day 47 of 216 — Stage 2, Week 11". */
  position: string;
}

export type LapseTier = "none" | "return" | "replan" | "archive_prompt";

export interface LapseState {
  consecutive_missed_days: number;
  tier: LapseTier;
}

export interface ConsistencyScore {
  planned: number;
  completed: number;
  /** 0–100, integer. 100 when nothing was planned yet. */
  percent: number;
  window_start: string;
  window_end: string;
}

export interface ValidationIssue {
  level: "error" | "warning";
  path: string;
  message: string;
}
