// IndexedDB store. Local-first source of truth (PATTERNS §1). No sync yet;
// the shape is already the sync shape: `completions` is append-only with
// client ids and timestamps so a later queue can replay it as-is.
import type { Availability, Completion, Plan } from "@keel/engine";

export interface Intention { after: string; place: string }
export interface EnrollmentRecord {
  plan: Plan;
  started_at: string;
  availability: Availability;
  intention: Intention;
  why: string;
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

const DB = "keel", VERSION = 2;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (!db.objectStoreNames.contains("completions")) db.createObjectStore("completions", { keyPath: "id" });
      if (!db.objectStoreNames.contains("reviews")) db.createObjectStore("reviews", { keyPath: "id" });
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
  /** Full wipe. Used by "Delete plan and history" and archive. */
  reset: async () => {
    await tx("kv", "readwrite", (s) => s.delete("enrollment"));
    await tx("kv", "readwrite", (s) => s.delete("timer"));
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
