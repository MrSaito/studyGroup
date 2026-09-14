// Phase B surface, loaded lazily after first paint (keeps the entry bundle inside its 80 KB budget).
// app.tsx does `import("./backend.ts")` when a backend is configured; Account.tsx imports it statically
// so the account UI and the network code share one chunk.
export * from "./auth.ts";
export * from "./sync.ts";
export * from "./push.ts";
