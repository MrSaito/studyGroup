// Product events (B6). Queued locally, pushed by sync. Never blocks the UI.
// Names are the blueprint §8 set; the metrics views ignore anything else.
import { store, type EventRow } from "./store.ts";

export type EventName = "unit_started" | "unit_done" | "pushed" | "swapped_review" | "return_started" | "return_done"
  | "replan_accepted" | "notification_opened" | "unit_skipped" | "review_saved" | "signed_in";

export function track(name: EventName, props: Record<string, string | number | boolean> = {}): void {
  const row: EventRow = { id: crypto.randomUUID(), name, props, at: new Date().toISOString() };
  store.enqueueEvent(row).catch(() => {});
}
