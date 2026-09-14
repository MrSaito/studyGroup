// IndexedDB store. Local-first source of truth (PATTERNS §1). No sync yet;
// the shape is already the sync shape: `completions` is append-only with
// client ids and timestamps so a later queue can replay it as-is.
import type { Availability, Completion, Plan } from "@keel/engine";

export interface Intention { after: string; place: string }
export interface EnrollmentRecord {
  /** Client uuid; the sync key. Older local records get one on first load. */
  id?: string;
  plan: Plan;
  started_at: string;
  availability: Availability;
  intention: Intention;
  why: string;
  /** ISO timestamp; last-write-wins across devices. */
  updated_at?: string;
}
export interface EventRow { id: string; name: string; props: Record<string, string | number | boolean>; at: string }
/** Sync bookkeeping (B4): which local rows the server has acknowledged, and the pull cursor. */
export interface SyncState {
  pushed_completions: string[];
  pushed_reviews: string[];
  pulled_completions_at: string | null;
  pulled_reviews_at: string | null;
  last_sync_at: string | null;
}
export interface CompletionRow extends Completion {
  id: string;           // client-generated, for idempotent sync later
  created_at: string;   // ISO timestamp
}
export interface Settings { locale: string }
/** Weekly review answers (Blueprint §3.6). Keyed by the Monday of the week. */
export interface ReviewRow {
  id: string;
  week_start: string;
  finished: string;
  stuck: string;
  next: string;
  created_at: string;
}
/** Timer state for the unit currently open, so a reload or a backgrounded tab never loses time (A2). */
export interface TimerState {
  unit_id: string;
  /** Epoch ms when the current run started, or null when paused. */
  started_at: number | null;
  /** Seconds accumulated before the current run. */
  base: number;
  log: string;
}

const DB = "keel", VERSION = 3;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (!db.objectStoreNames.contains("completions")) db.createObjectStore("completions", { keyPath: "id" });
      if (!db.objectStoreNames.contains("reviews")) db.createObjectStore("reviews", { keyPath: "id" });
      if (!db.objectStoreNames.contains("events")) db.createObjectStore("events", { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const t = db.transaction(store, mode);
    const r = fn(t.objectStore(store));
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    t.oncomplete = () => db.close();
  }));
}

export const store = {
  getEnrollment: () => tx<EnrollmentRecord | undefined>("kv", "readonly", (s) => s.get("enrollment")),
  putEnrollment: (e: EnrollmentRecord) => tx("kv", "readwrite", (s) => s.put(e, "enrollment")),
  getSettings: async (): Promise<Settings> => (await tx<Settings | undefined>("kv", "readonly", (s) => s.get("settings"))) ?? { locale: "en" },
  putSettings: (v: Settings) => tx("kv", "readwrite", (s) => s.put(v, "settings")),
  listCompletions: async (): Promise<CompletionRow[]> => {
    const rows = await tx<CompletionRow[]>("completions", "readonly", (s) => s.getAll());
    return rows.sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  },
  appendCompletion: (c: Completion): Promise<CompletionRow> => {
    const row: CompletionRow = { ...c, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    return tx("completions", "readwrite", (s) => s.add(row)).then(() => row);
  },
  listReviews: async (): Promise<ReviewRow[]> => {
    const rows = await tx<ReviewRow[]>("reviews", "readonly", (s) => s.getAll());
    return rows.sort((a, b) => (a.week_start < b.week_start ? -1 : 1));
  },
  addReview: (r: Omit<ReviewRow, "id" | "created_at">): Promise<ReviewRow> => {
    const row: ReviewRow = { ...r, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    return tx("reviews", "readwrite", (s) => s.add(row)).then(() => row);
  },
  /** Insert a row that came from the server; a no-op if the id already exists locally. */
  putCompletionIfAbsent: async (row: CompletionRow): Promise<boolean> => {
    const existing = await tx<CompletionRow | undefined>("completions", "readonly", (s) => s.get(row.id));
    if (existing) return false;
    await tx("completions", "readwrite", (s) => s.put(row));
    return true;
  },
  putReviewIfAbsent: async (row: ReviewRow): Promise<boolean> => {
    const existing = await tx<ReviewRow | undefined>("reviews", "readonly", (s) => s.get(row.id));
    if (existing) return false;
    await tx("reviews", "readwrite", (s) => s.put(row));
    return true;
  },
  // ---- Phase B: session, sync state, event queue ----
  getSession: () => tx<import("./auth.ts").Session | undefined>("kv", "readonly", (s) => s.get("session")),
  putSession: (v: import("./auth.ts").Session) => tx("kv", "readwrite", (s) => s.put(v, "session")),
  clearSession: () => tx("kv", "readwrite", (s) => s.delete("session")),
  getSyncState: async (): Promise<SyncState> => (await tx<SyncState | undefined>("kv", "readonly", (s) => s.get("sync")))
    ?? { pushed_completions: [], pushed_reviews: [], pulled_completions_at: null, pulled_reviews_at: null, last_sync_at: null },
  putSyncState: (v: SyncState) => tx("kv", "readwrite", (s) => s.put(v, "sync")),
  clearSyncState: () => tx("kv", "readwrite", (s) => s.delete("sync")),
  enqueueEvent: (e: EventRow) => tx("events", "readwrite", (s) => s.put(e)),
  listEvents: () => tx<EventRow[]>("events", "readonly", (s) => s.getAll()),
  deleteEvents: async (ids: string[]) => { for (const id of ids) await tx("events", "readwrite", (s) => s.delete(id)); },
  getTimer: () => tx<TimerState | undefined>("kv", "readonly", (s) => s.get("timer")),
  putTimer: (t: TimerState) => tx("kv", "readwrite", (s) => s.put(t, "timer")),
  clearTimer: () => tx("kv", "readwrite", (s) => s.delete("timer")),
  /** Replace everything on this device with a backup (export file). */
  restore: async (d: { enrollment: EnrollmentRecord; completions: CompletionRow[]; reviews: ReviewRow[] }) => {
    await store.reset();
    await store.putEnrollment(d.enrollment);
    for (const c of d.completions) await tx("completions", "readwrite", (s) => s.put(c));
    for (const r of d.reviews) await tx("reviews", "readwrite", (s) => s.put(r));
  },
  /** Full wipe of plan data. Used by "Delete plan and history", "Start a new plan", restore and archive. The session survives. */
  reset: async () => {
    await tx("kv", "readwrite", (s) => s.delete("enrollment"));
    await tx("kv", "readwrite", (s) => s.delete("timer"));
    await tx("kv", "readwrite", (s) => s.delete("sync"));
    await tx("completions", "readwrite", (s) => s.clear());
    await tx("reviews", "readwrite", (s) => s.clear());
  },
  exportAll: async () => ({
    exported_at: new Date().toISOString(),
    enrollment: await store.getEnrollment(),
    completions: await store.listCompletions(),
    reviews: await store.listReviews(),
  }),
};
