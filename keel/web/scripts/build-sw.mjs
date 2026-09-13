// Generates dist/sw.js after `vite build`. Precache list is computed from the
// real dist tree; SW_VERSION is APP_VERSION + content hash so a rebuild with
// changed bytes always invalidates old caches (PATTERNS §1, SECURITY-BASELINE).
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const versionSrc = readFileSync(new URL("../src/version.ts", import.meta.url), "utf8");
const appVersion = /APP_VERSION\s*=\s*"([^"]+)"/.exec(versionSrc)?.[1] ?? "0.0.0";

function walk(dir) {
  return readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
}
const files = walk(dist).filter((f) => !f.endsWith("sw.js") && !f.endsWith("vercel.json")).map((f) => "./" + relative(dist, f).replaceAll("\\", "/"));
const hash = createHash("sha256");
for (const f of files) hash.update(readFileSync(join(dist, f)));
const SW_VERSION = `${appVersion}-${hash.digest("hex").slice(0, 8)}`;

const sw = `// generated — do not edit
const SW_VERSION = ${JSON.stringify(SW_VERSION)};
const CACHE = "keel-" + SW_VERSION;
const PRECACHE = ${JSON.stringify(files)};

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Same-origin GET only. App shell is cache-first (immutable, hashed by Vite).
// Cross-origin (future API) is never cached here — sync layer owns that.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).catch(() => caches.match("./index.html"))));
});
`;
writeFileSync(join(dist, "sw.js"), sw);
console.log(`sw.js written: SW_VERSION=${SW_VERSION}, ${files.length} precached files`);
