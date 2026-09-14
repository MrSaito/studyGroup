// Local-first, append-only sync (CLAUDE.md §5.3, B4) over PostgREST with fetch.
//   completions / reviews: push rows the server lacks, pull rows the client lacks, union.
//   enrollment: one per user, last-write-wins on updated_at.
//   events: push and forget.
// Triggers (wired in app.tsx): sign-in, app open, visibilitychange, after every
// write, and `online`. Never blocks the UI; failures back off (2 s … 5 min).
// An expired session keeps every queue intact and reports "reauth".
import { AuthExpired, freshSession, type Session } from "./auth.ts";
import { BACKEND } from "./config.ts";
import { store, type CompletionRow, type EnrollmentRecord, type ReviewRow } from "./store.ts";

export type SyncStatus = "signed_out" | "idle" | "syncing" | "offline" | "error" | "reauth";
export interface SyncReport { status: SyncStatus; last_sync_at: string | null; pulled: number; error?: string }

interface Hooks {
  getRec: () => EnrollmentRecord | null;
  /** The server had a newer enrollment (or gave ours an id): adopt it. */
  onEnrollment: (rec: EnrollmentRecord) => Promise<void>;
  /** New rows arrived from another device. */
  onPulled: () => Promise<void>;
  onStatus: (r: SyncReport) => void;
}

const rest = () => `${BACKEND.url}/rest/v1`;

function fail(r: Response, text: string): never { throw new Error(`${r.status} ${text.slice(0, 200)}`); }

async function api(session: Session, path: string, init: RequestInit & { prefer?: string } = {}): Promise<unknown> {
  const r = await fetch(`${rest()}${path}`, {
    ...init,
    headers: { apikey: BACKEND.anonKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Accept: "application/json", ...(init.prefer ? { Prefer: init.prefer } : {}), ...(init.headers ?? {}) },
  });
  const text = await r.text();
  if (r.status === 401) throw new AuthExpired();
  if (!r.ok) fail(r, text);
  return text ? JSON.parse(text) : null;
}

export class Sync {
  private running = false;
  private queued = false;
  private backoffMs = 2000;
  private timer: number | null = null;
  private debounce: number | null = null;
  constructor(private hooks: Hooks) {}

  /** Coalesces bursts of writes into one run 1.5 s later. */
  request(): void {
    if (this.debounce != null) clearTimeout(this.debounce);
    this.debounce = window.setTimeout(() => { this.debounce = null; void this.run(); }, 1500);
  }

  async run(): Promise<SyncReport> {
    if (this.running) { this.queued = true; return { status: "syncing", last_sync_at: null, pulled: 0 }; }
    this.running = true;
    let report: SyncReport;
    try {
      report = await this.once();
      this.backoffMs = 2000;
    } catch (e) {
      const st = await store.getSyncState();
      if (e instanceof AuthExpired) report = { status: "reauth", last_sync_at: st.last_sync_at, pulled: 0 };
      else if (!navigator.onLine || (e instanceof TypeError)) report = { status: "offline", last_sync_at: st.last_sync_at, pulled: 0 };
      else report = { status: "error", last_sync_at: st.last_sync_at, pulled: 0, error: (e as Error).message };
      if (report.status === "error" || report.status === "offline") this.scheduleRetry();
    } finally { this.running = false; }
    this.hooks.onStatus(report);
    if (this.queued) { this.queued = false; void this.run(); }
    return report;
  }

  private scheduleRetry(): void {
    if (this.timer != null) clearTimeout(this.timer);
    this.timer = window.setTimeout(() => { this.timer = null; void this.run(); }, this.backoffMs);
    this.backoffMs = Math.min(this.backoffMs * 2, 5 * 60 * 1000);
  }

  private async once(): Promise<SyncReport> {
    const session = await freshSession();
    if (!session) return { status: "signed_out", last_sync_at: null, pulled: 0 };
    this.hooks.onStatus({ status: "syncing", last_sync_at: null, pulled: 0 });
    const uid = session.user.id;
    let pulled = 0;

    // ---- enrollment: LWW ----
    let rec = this.hooks.getRec();
    const remote = (await api(session, `/enrollments?select=*&status=eq.active&order=updated_at.desc&limit=1`)) as Array<Record<string, unknown>>;
    const r0 = remote[0];
    if (rec) {
      const localAt = rec.updated_at ?? "1970-01-01T00:00:00.000Z";
      if (r0 && String(r0.updated_at) > localAt && r0.id !== rec.id) {
        // Another device's enrollment is newer: adopt it (plan, availability, why, id).
        rec = { id: String(r0.id), plan: r0.plan as EnrollmentRecord["plan"], started_at: String(r0.started_at), availability: r0.availability as EnrollmentRecord["availability"], intention: (r0.intention as EnrollmentRecord["intention"]) ?? { after: "", place: "" }, why: String(r0.why ?? ""), updated_at: String(r0.updated_at) };
        await this.hooks.onEnrollment(rec);
        const st = await store.getSyncState();
        await store.putSyncState({ ...st, pulled_completions_at: null, pulled_reviews_at: null });
      } else if (r0 && String(r0.updated_at) > localAt && r0.id === rec.id) {
        rec = { ...rec, plan: r0.plan as EnrollmentRecord["plan"], availability: r0.availability as EnrollmentRecord["availability"], intention: (r0.intention as EnrollmentRecord["intention"]) ?? rec.intention, why: String(r0.why ?? rec.why), updated_at: String(r0.updated_at) };
        await this.hooks.onEnrollment(rec);
      } else if (!r0 || String(r0.updated_at) < localAt || r0.id !== rec.id) {
        // Local is newer (or the server has nothing): upsert ours; retire a different remote row.
        if (r0 && r0.id !== rec.id) await api(session, `/enrollments?id=eq.${r0.id}`, { method: "PATCH", body: JSON.stringify({ status: "archived" }), prefer: "return=minimal" });
        await api(session, `/enrollments?on_conflict=id`, { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: JSON.stringify({
          id: rec.id, user_id: uid, plan: rec.plan, started_at: rec.started_at, availability: rec.availability, intention: rec.intention, why: rec.why, status: "active", updated_at: rec.updated_at ?? new Date().toISOString(),
        }) });
      }
    } else if (r0) {
      // Fresh device, existing account: take the server's enrollment.
      rec = { id: String(r0.id), plan: r0.plan as EnrollmentRecord["plan"], started_at: String(r0.started_at), availability: r0.availability as EnrollmentRecord["availability"], intention: (r0.intention as EnrollmentRecord["intention"]) ?? { after: "", place: "" }, why: String(r0.why ?? ""), updated_at: String(r0.updated_at) };
      await this.hooks.onEnrollment(rec);
    }
    if (!rec?.id) return this.finish("idle", pulled);
    const eid = rec.id;

    // ---- completions: push unseen, pull unseen ----
    // Pull cursor is >= (not >): rows can share a created_at (same millisecond, or two devices with a pinned
    // clock); duplicates are dropped by id on insert, so re-reading the boundary row is free.
    const st = await store.getSyncState();
    const pushedC = new Set(st.pushed_completions);
    const localC = await store.listCompletions();
    const toPushC = localC.filter((c) => !pushedC.has(c.id));
    if (toPushC.length) {
      await api(session, `/completions?on_conflict=id`, { method: "POST", prefer: "resolution=ignore-duplicates,return=minimal", body: JSON.stringify(toPushC.map((c) => ({
        id: c.id, user_id: uid, enrollment_id: eid, unit_id: c.unit_id, date: c.date, outcome: c.outcome, minutes: c.minutes ?? null, log_text: c.log_text ?? null, created_at: c.created_at,
      }))) });
      for (const c of toPushC) pushedC.add(c.id);
    }
    const sinceC = st.pulled_completions_at;
    const remoteC = (await api(session, `/completions?select=id,unit_id,date,outcome,minutes,log_text,created_at&enrollment_id=eq.${eid}${sinceC ? `&created_at=gte.${encodeURIComponent(sinceC)}` : ""}&order=created_at.asc&limit=1000`)) as CompletionRow[];
    let maxC = sinceC;
    for (const row of remoteC) {
      const clean: CompletionRow = { id: row.id, unit_id: row.unit_id, date: row.date, outcome: row.outcome, created_at: row.created_at, ...(row.minutes != null ? { minutes: row.minutes } : {}), ...(row.log_text ? { log_text: row.log_text } : {}) };
      if (await store.putCompletionIfAbsent(clean)) pulled++;
      pushedC.add(row.id);
      if (!maxC || row.created_at > maxC) maxC = row.created_at;
    }

    // ---- reviews: same ----
    const pushedR = new Set(st.pushed_reviews);
    const localR = await store.listReviews();
    const toPushR = localR.filter((r) => !pushedR.has(r.id));
    if (toPushR.length) {
      await api(session, `/reviews?on_conflict=id`, { method: "POST", prefer: "resolution=ignore-duplicates,return=minimal", body: JSON.stringify(toPushR.map((r) => ({
        id: r.id, user_id: uid, enrollment_id: eid, week_start: r.week_start, finished: r.finished, stuck: r.stuck, next: r.next, created_at: r.created_at,
      }))) });
      for (const r of toPushR) pushedR.add(r.id);
    }
    const sinceR = st.pulled_reviews_at;
    const remoteR = (await api(session, `/reviews?select=id,week_start,finished,stuck,next,created_at&enrollment_id=eq.${eid}${sinceR ? `&created_at=gte.${encodeURIComponent(sinceR)}` : ""}&order=created_at.asc&limit=500`)) as ReviewRow[];
    let maxR = sinceR;
    for (const row of remoteR) {
      if (await store.putReviewIfAbsent({ id: row.id, week_start: row.week_start, finished: row.finished, stuck: row.stuck, next: row.next, created_at: row.created_at })) pulled++;
      pushedR.add(row.id);
      if (!maxR || row.created_at > maxR) maxR = row.created_at;
    }

    // ---- events: push and forget ----
    const events = await store.listEvents();
    if (events.length) {
      await api(session, `/events`, { method: "POST", prefer: "return=minimal", body: JSON.stringify(events.map((e) => ({ user_id: uid, name: e.name, props: e.props, at: e.at }))) });
      await store.deleteEvents(events.map((e) => e.id));
    }

    await store.putSyncState({ pushed_completions: [...pushedC], pushed_reviews: [...pushedR], pulled_completions_at: maxC, pulled_reviews_at: maxR, last_sync_at: new Date().toISOString() });
    if (pulled) await this.hooks.onPulled();
    return this.finish("idle", pulled);
  }

  private async finish(status: SyncStatus, pulled: number): Promise<SyncReport> {
    const st = await store.getSyncState();
    return { status, last_sync_at: st.last_sync_at, pulled };
  }
}

/** Profile row (tz + locale) used by the nudge function. Cheap; called after sign-in and on locale change. */
export async function pushProfile(locale: string): Promise<void> {
  const session = await freshSession();
  if (!session) return;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Karachi";
  await api(session, `/users?id=eq.${session.user.id}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ tz, locale, updated_at: new Date().toISOString() }) });
}

export { api as restApi };
