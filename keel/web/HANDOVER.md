# HANDOVER.md — Keel, session 3 (2026-09-14) — DEPLOYED

## Session 3: production deploy
**Live:** https://keel-hshahfahad58-2498s-projects.vercel.app/
Vercel project `keel` (team hshahfahad58-2498s-projects, hobby plan, $0).
Deployed as static files from `dist/` via the Vercel MCP — no git, no build
on Vercel. `public/vercel.json` sets: `sw.js` no-store, `index.html`
no-cache, `assets/*` immutable 1y, plus nosniff / DENY / no-referrer / CSP
(`default-src 'self'`; no third-party origins at all).

Verified against production, not just locally:
- All four routes 200; headers present (checked with curl).
- **Byte-exact**: sha256 of remote `index.html`, `sw.js`, `assets/index-*.js`
  == local dist (guards against transcription in the MCP upload).
- `KEEL_URL=<prod> python3 scripts/smoke.py` → SMOKE PASSED, including
  offline reload with the SW.

Deployment protection: the project defaulted to Vercel Authentication on
all URLs (302 → login). Changed to **preview-only** so production is public
— acceptable because the app has no backend and stores nothing off-device.
Revisit when a backend exists.

To redeploy after changes: `./verify.sh && npx vercel --prod dist` (Vercel
CLI, needs `vercel login` once in Termux), or ask Claude to push via the
Vercel MCP again. Either way, `APP_VERSION` in `src/version.ts` must be
bumped for a user-visible release; the SW hash changes automatically.

## What was built (session 2)
`web/` — `@keel/web` v0.1.0. Preact + Vite PWA, **one runtime dependency
(preact, MIT)**, 45 KB JS / 17.7 KB gzipped. Local-only: IndexedDB is the
source of truth, no backend, no network calls. Blueprint §12.2 delivered:
Today / Unit / Progress against local storage, plus Onboarding, Settings,
and the three lapse flows (Return / Re-plan / Archive prompt).

| File | What |
|---|---|
| `src/app.tsx` | State container + screen switch. Computes `project()`, `consistency()`, `lapse()` once per render; screens are pure views |
| `src/store.ts` | IndexedDB (`kv` + append-only `completions` with client UUID + timestamp — already the sync shape) |
| `src/screens/Onboarding.tsx` | goal ("why") → plan (paste md/JSON or sample) → availability → implementation intention |
| `src/screens/Today.tsx` | One unit card, **course line**, Start / Not today (push · 10-min review), rest day, done-for-today, non-available day, plan complete; lapse flows before the card |
| `src/screens/Unit.tsx` | Conic-gradient countdown, learn/do/tip/deliverable, 3-line log, Done. Review mode records `swapped_review` against the current plan unit |
| `src/screens/Progress.tsx` | Stage → week → unit cells (done / current / todo / buffer / consumed), consistency %, course line |
| `src/screens/Settings.tsx` | Language (en/ur, RTL), export JSON, delete everything, version |
| `src/i18n.ts` | Full en + ur string tables, `dir` switched on `<html>` |
| `scripts/build-sw.mjs` | Generates `dist/sw.js` after `vite build`: precache list from the real dist tree, `SW_VERSION = APP_VERSION-<sha256 of dist>` so any byte change invalidates old caches |
| `scripts/verify.mjs` | Dist assertions: SW_VERSION present, every precache entry on disk, manifest linked, secret-pattern grep, **80 KB JS budget** |
| `scripts/smoke.py` | Headless Chromium: onboard → complete unit → reload persists → progress cells → Urdu RTL → SW registered → **offline reload works** |
| `verify.sh` | engine gate → typecheck → build → dist assertions → smoke → licences |

Design: paper `#F7F6F2` / ink `#12262E` / keel teal `#1F6F78` / sand `#D9D2C0`.
System font stack only (no webfont bytes). No red anywhere. No "overdue",
no miss counts on any screen — verified by reading every string in `i18n.ts`.

## Verification (run and passed)
```
$ cd web && ./verify.sh
== engine            ALL GATES PASSED
== typecheck         (clean)
== build             sw.js written: SW_VERSION=0.1.0-6c32cd7c, 7 precached files
== dist assertions   dist OK: 7 precached, JS 45.0 KB (limit 80 KB)
== browser smoke     Today: Variables and types | Day 1 of 10 … Finish by 25 Sept
                     Persisted after reload: Lists and dictionaries
                     Progress cells: 10 done: 1 | score: 100%
                     Urdu RTL: ترتیبات
                     Offline reload OK: Lists and dictionaries
                     SMOKE PASSED
== licences          MIT: 1 (preact); UNLICENSED: 1 is this private package
ALL GATES PASSED
```
Screenshots reviewed at 390×844 for all four screens.

## Bug found and fixed by the smoke test
Sandbox clock was Sunday; a fresh weekday-only enrollment showed "Done for
today" on a non-available day. Now: `daySpent()` → "Done for today.",
otherwise "Nothing planned today." Smoke pins the browser clock to a Monday.

## SECURITY-BASELINE pass (local-only build)
- No secrets, no env, no network — bundle grepped for key patterns in `verify.mjs`.
- SW caches same-origin GET only; cross-origin never touched. Falls back to
  `index.html` offline. Old caches deleted on activate.
- IndexedDB is **unencrypted** on device. Logs and the "why" note are the
  only personal data. Accepted for local-only alpha; revisit at sync
  (encrypt-at-rest is a Supabase-side concern; device-side stays plain).
- No `dangerouslySetInnerHTML`; all user text rendered as text nodes.
- Not yet applicable: RLS, authZ, rate limits, CORS — no backend exists.

## Deferred
- **Notifications** (§3.5) — the single biggest missing loop. Needs a push
  server (Supabase Edge Function + VAPID) or, for v0.2 local-only, the
  Notification Triggers API is Chrome-only and unreliable; use a daily
  check-on-open for now. Decision needed: build backend push next, or run
  the self-use week without it.
- Sync / auth / Supabase — nothing. Store shape is ready.
- Weekly review + retrieval quiz (§3.6), calendar hold, adaptive timing.
- `src/sample-plan.md` is a copy of `engine/examples/sample-plan.md` — one
  source is needed; make Vite import the engine's copy.
- Timer runs on `setInterval`; backgrounding the tab pauses it on iOS. Store
  `startedAt` and compute on resume.
- Archive-restart rebuilds the plan from the current stage with `seq`
  renumbered — tested by type only, not by smoke.
- Urdu strings machine-drafted; native review before any user sees them.
- Real 36-week roadmap still not imported (file never provided).

## Exact next action (no command — it's on you)
Open https://keel-hshahfahad58-2498s-projects.vercel.app/ in Chrome on the
Pixel, install to Home Screen, onboard with the sample plan (or paste your
own Markdown), and use it for one week. That is Blueprint §12.2. Session 3 decision point: if the Today card pulls
you in, build push notifications (needs the first backend); if it doesn't,
fix Today before anything else.
