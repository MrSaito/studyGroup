// Post-build assertions. Exit 1 on any failure.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const dist = new URL("../dist/", import.meta.url).pathname;
const fail = (m) => { console.error("FAIL: " + m); process.exit(1); };
for (const f of ["index.html", "sw.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"]) if (!existsSync(join(dist, f))) fail(`missing dist/${f}`);
const sw = readFileSync(join(dist, "sw.js"), "utf8");
if (!/const SW_VERSION = "\d+\.\d+\.\d+-[0-9a-f]{8}"/.test(sw)) fail("sw.js has no SW_VERSION constant");
const precache = JSON.parse(/const PRECACHE = (\[.*?\]);/s.exec(sw)[1]);
for (const p of precache) if (!existsSync(join(dist, p))) fail(`precache entry not on disk: ${p}`);
if (!precache.includes("./index.html")) fail("index.html not precached");
const html = readFileSync(join(dist, "index.html"), "utf8");
if (!html.includes('rel="manifest"')) fail("manifest link missing");
if (/(sk-|eyJhbGci|supabase\.co)/.test(readdirSync(join(dist, "assets")).map((f) => readFileSync(join(dist, "assets", f), "utf8")).join(""))) fail("possible secret in bundle");
// JS budget. Entry = every script index.html loads on first paint (80 KB, unchanged).
// Lazy = chunks only fetched on demand — today the bundled plan templates
// (A8: the 36-week roadmap is ~110 KB of Markdown as a string module; it is
// precached for offline onboarding but never on the first-paint path).
// 120 KB per lazy chunk is the explicit A8 ceiling from CLAUDE.md §6.
const js = readdirSync(join(dist, "assets")).filter((f) => f.endsWith(".js"));
const entryNames = new Set([...html.matchAll(/(?:src|href)="\.\/assets\/([^"]+\.js)"/g)].map((m) => m[1]));
if (entryNames.size === 0) fail("index.html references no JS entry");
const size = (f) => statSync(join(dist, "assets", f)).size;
const entryBytes = js.filter((f) => entryNames.has(f)).reduce((n, f) => n + size(f), 0);
const ENTRY_LIMIT = 80 * 1024, LAZY_LIMIT = 120 * 1024;
if (entryBytes > ENTRY_LIMIT) fail(`entry JS ${entryBytes} B exceeds ${ENTRY_LIMIT} B budget (expensive data — PATTERNS §10/STACK)`);
const lazy = js.filter((f) => !entryNames.has(f));
for (const f of lazy) if (size(f) > LAZY_LIMIT) fail(`lazy chunk ${f} is ${size(f)} B, over the ${LAZY_LIMIT} B template ceiling`);
if (!lazy.some((f) => f.startsWith("ai-engineer-36w"))) fail("roadmap template chunk missing from dist/assets (should be a lazy chunk, not inlined)");
console.log(`dist OK: ${precache.length} precached, entry JS ${(entryBytes / 1024).toFixed(1)} KB (limit ${ENTRY_LIMIT / 1024} KB), lazy ${lazy.map((f) => `${f.replace(/-[\w]+\.js$/, "")} ${(size(f) / 1024).toFixed(1)} KB`).join(", ")} (limit ${LAZY_LIMIT / 1024} KB each), ${/SW_VERSION = "([^"]+)"/.exec(sw)[1]}`);
