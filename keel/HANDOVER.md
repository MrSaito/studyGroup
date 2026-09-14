# HANDOVER.md — Keel, session 5 (2026-09-14) — Phase A complete: A2 A3 A4 A5, 0.2.0

## Session 5 — 2026-09-14 — A2 timer · A3 weekly review · A4 plan screen + `skipped` · A5 file import · Phase A exit
Built:
- **A2 `web/src/screens/Unit.tsx`** — timer is `base + (now − started_at)`; nothing depends on the interval firing. Ticks stop while hidden and a `visibilitychange` recomputes synchronously. State (`started_at`, `base`, draft log) persists in IndexedDB `kv.timer`; `app.tsx` reopens the running unit after a reload (plan units and the Return unit). Done clears it.
- **A3 `engine/src/review.ts`** — `weekStart` (Monday), `isReviewDay` (Fri/Sun), `retrievalQuiz` (done units with a log ≥7 days old, one per unit, no buffers, ≤3, PRNG seeded from the week's Monday, returned in plan order), `seedFrom`/`seededRandom` (FNV-1a + mulberry32, zero deps). `web/src/screens/Review.tsx` — recall-before-reveal quiz, then finished / stuck / next → `reviews` row. Nudge card on Today on Fri/Sun until the week has a row; always reachable from Progress ("Weekly review" → "Reviewed this week").
- **A4** — engine: `CompletionOutcome` gains `skipped`; `advancedUnitIds` (done ∪ skipped) drives the projection; `skippedUnitIds`; `daySpent` ignores skips; `buildReturnUnit` targets the first non-advanced unit. `web/src/screens/Plan.tsx` — read-only sequence by stage/week with projected dates; "Skip this unit" on current/todo non-buffer units → reason sheet → `skipped` completion. Progress shows skipped as a hollow dashed cell (aria-label carries the state). New "Plan" tab; tabs carry `data-tab`.
- **A5 `Onboarding.tsx`** — `<input type=file accept=".md,.json,…">` under the paste box; reads the file, fills the box, imports.
- `web/src/store.ts` — IndexedDB **v2**: new `reviews` store; `timer` in kv; export includes reviews; reset clears both. Upgrade from v1 is additive.
- `web/src/i18n.ts` — 25 new strings en + ur (`// draft`, A6 still open).
- `web/scripts/e2e-timer.py` — A2 gate (fake clock: 10 s → hide → 5 min → show → 34:50; reload → still running, log restored). `web/scripts/smoke.py` — rewritten path covers A3/A4/A5/A8 (see Verified). `verify.sh` runs both.
- `engine/test/engine.test.ts` — 31 tests (+3: skipped semantics; weekStart/isReviewDay; retrievalQuiz rules + determinism).
- `web/src/version.ts` — **APP_VERSION 0.2.0** (Phase A exit).

Verified:
```
$ cd engine && ./verify.sh            # pass 31 / fail 0 · sample 0 issues · roadmap 252 units 0 errors, plans/ in sync · ALL GATES PASSED
$ cd web && ./verify.sh
== dist assertions  dist OK: 8 precached, entry JS 57.7 KB (limit 80 KB), lazy ai-engineer-36w 109.6 KB (limit 120 KB each), 0.2.0-fdeddd98
== browser smoke    Today: Variables and types | Day 1 of 10 … · Persisted after reload
                    Plan: skipped unit 3 | Day 2 of 10 (day still spent, today unchanged)
                    Progress cells: 10 done: 1 skipped: 1 | score: 100% · Weekly review saved: Reviewed this week
                    Urdu RTL · Offline reload OK · Roadmap offline: Set up the machine | Day 1 of 252 · 252 cells, 7 stages
                    File import: Sample: Two-Week Python Warm-up — 10 units · SMOKE PASSED
                    Hidden 5 min → display 34:50 · After reload → display 34:47 | log restored · TIMER E2E PASSED
ALL GATES PASSED
```

Deployed: **yes — 0.2.0 live** at https://keel-hshahfahad58-2498s-projects.vercel.app/ (deployment `dpl_BzF1xSfHymp2owHLRdRysUHGchME`, built by Vercel from commit `8d3d7ec`). Verified from the sandbox: all 9 production files sha256-equal to the local `dist/` that passed the gate; `SW_VERSION = "0.2.0-fdeddd98"` served; CSP / nosniff / DENY / no-referrer headers present; `sw.js` no-store, `assets/*` immutable. First attempt (`dpl_FA2d17…`) failed before deploying because Vercel's restored build cache still held the previous `repo/` clone — `build.sh` now `rm -rf repo out` first; production was never touched by the failed build. Smoke vs prod: not runnable from this sandbox (see Decisions); run from Termux.

Decisions made (with reason):
- **§4 semantics extended, not changed:** `skipped` is a fourth outcome. It advances the unit (never served again), is not a session (consistency and lapse ignore it), and — the one deliberate deviation from "any completion row dated today makes today null" — does **not** spend the day, because it is recorded from the Plan screen, possibly weeks ahead, and must not turn today's card into "Done for today". Encoded in the `skipped` test. The three original outcomes are untouched.
- **Retrieval quiz seed = the week's Monday**, so a learner who opens the review twice in a week sees the same items; the pool can still grow later in the week as more logs cross the 7-day line (tested).
- **Review reachable any day from Progress**, not only Fri/Sun: the Fri/Sun card is the nudge, not a gate — and the smoke pins a Monday.
- **Skipping the current unit is allowed** (the "I already know this" case); buffers and done units are not skippable.
- **Running timer reopens its unit on load.** Without this a reload mid-session hid a running timer on the Today card. Surfaced by the A2 gate.
- **Deploy method (used for 0.1.1 and 0.2.0):** Vercel builds from a pinned public commit — the upload is 3 files (`package.json`, `build.sh` that clones `MrSaito/studyGroup` at the SHA and runs `npm ci && npm run build` in `keel/web`, `vercel.json` headers), Vercel installs nothing at the root and serves `out/`. Byte-exact (same SW hash as local), no hand-transcribed bundle, no Vercel login needed. Project build settings are now `buildCommand=bash build.sh`, `outputDirectory=out`; `npx vercel --prod dist` from Termux still works (static upload ignores them).
- **Smoke vs prod cannot run from the Claude sandbox:** headless Chromium's TLS handshake is dropped by the egress proxy tunnel (curl is fine). Substitute used: sha256 of every production file equals the local `dist/` the smoke passed on. Run `KEEL_URL=<prod> python3 scripts/smoke.py` from Termux for the real thing.

Deferred / partial:
- A6 Urdu review (Saito) — now 30 draft strings. A7 Today fixes — waiting on the self-use week report.
- `planCompleteHint` promises "Import a new plan from Settings" but Settings has no import; pre-existing copy gap, noted, not fixed (Phase A2/A7 material).
- Blueprint §3.6 quiz is ungraded by design; no spaced-repetition scheduling of items.
- Skip reasons are stored in `log_text` of the `skipped` row; not surfaced anywhere yet (coach input in Phase C).

Exact next command:
```
# Phase B entry is Saito's call ("Today works"). Until then nothing to build; if he reports Today issues → A7.
cd keel/web && ./verify.sh
```

---

# HANDOVER.md — Keel, session 4 (2026-09-14) — A1 + A8: real roadmap bundled

## Session 4 — 2026-09-14 — A8 Import the real roadmap (+ A1 dedupe sample plan)
Built:
- `plans/ai-engineer-36w.json` — the committed plan (252 units, id `ai-engineer-36w`, source `template`), generated by `keel-plan import --id=ai-engineer-36w --source=template`.
- `engine/examples/ai-engineer-36w.md` — the roadmap source, byte-identical to the file Saito supplied. Roadmap dialect (B) in `importMarkdown.ts` was already in the tree from session 3 but untested and unrecorded; now covered.
- `engine/bin/keel-plan.ts` — `import` gains `--id= --source= --locale=`.
- `engine/test/engine.test.ts` — 3 new tests (28 total): 252 units / 36 weeks / stages 0–6 / appendices excluded / 0 errors; week shape learn×4 (60 min) → review → build (420 min) → rest buffer; 5 exit-test checkpoints at weeks 2, 9, 13, 19, 25; import deep-equals `plans/ai-engineer-36w.json`; 7-day projection finishes on day 252.
- `engine/verify.sh` — new gate step: roadmap import 0 errors AND in sync with `plans/`.
- `web/src/templates.ts` — bundled templates. Sample is inlined (1.4 KB). Roadmap is a **lazy Vite chunk** (`import("@keel/examples/ai-engineer-36w.md?raw")`), parsed on device by the engine importer.
- `web/src/screens/Onboarding.tsx` — "Use the AI Engineer roadmap (36 weeks)" above "Use the sample plan (2 weeks)"; loading state; buttons carry `data-template` for tests. Pasted plans show at most 3 validation notes + "…and N more"; bundled templates show none.
- `web/src/i18n.ts` — 5 new strings, en + ur (`// draft`, pending A6).
- `web/vite.config.ts`, `web/tsconfig.json` — alias `@keel/examples` → `engine/examples`; dev server allowed to read `..`. `web/src/sample-plan.md` deleted (A1 done). `engine/examples/ai-engineer-36w.json` deleted (canonical copy is `plans/`).
- `web/scripts/verify.mjs` — JS budget split: **entry ≤ 80 KB (unchanged)**, each **lazy chunk ≤ 120 KB** (the A8 ceiling from CLAUDE.md §6; reason: the roadmap is 110 KB of Markdown as a string module, precached for offline onboarding, never on the first-paint path). Also asserts the roadmap chunk exists as a lazy chunk.
- `web/scripts/smoke.py` — new tail: while still offline, delete everything → onboard with the roadmap → "Set up the machine", "Day 1 of 252", 252 progress cells, 7 stages. Proves the lazy chunk is served from the SW cache.
- `web/verify.sh` — **bug fixed**: a failing smoke was swallowed by `|| echo skipped` and the gate still printed ALL GATES PASSED. Now a smoke failure fails the gate.
- `web/src/version.ts` — APP_VERSION 0.1.1.

Verified:
```
$ cd engine && ./verify.sh
== tests            # pass 28  # fail 0
== sample import    sample-plan.md → 10 units, 0 issues
== roadmap import   ai-engineer-36w.md → 252 units, 0 errors, 106 warnings (accepted, see HANDOVER); plans/ai-engineer-36w.json in sync
ALL GATES PASSED
$ cd web && ./verify.sh
== build            index-*.js 49.47 kB (gzip 19.02) · ai-engineer-36w-*.js 112.24 kB (gzip 42.93) · SW_VERSION=0.1.1-f76d3417, 8 precached
== dist assertions  dist OK: 8 precached, entry JS 48.3 KB (limit 80 KB), lazy ai-engineer-36w 109.6 KB (limit 120 KB each)
== browser smoke    Today: Variables and types | Day 1 of 10 … · Persisted · Progress 10/1 · Urdu RTL · Offline reload OK
                    Roadmap offline: Set up the machine | Day 1 of 252 — Stage 0, Week 1 · Roadmap progress cells: 252 | stages: 7
                    SMOKE PASSED
ALL GATES PASSED
```
Sandbox note: `pip install playwright==1.56.0` matches the preinstalled Chromium 141; newer wheels want a browser download.

Deployed: **yes, 0.1.1** (on Saito's instruction, after the session-4 handover was first written as "no"). Method: see session 5 — Vercel built it from commit `7509436` inside its own build container; every production file sha256-matched the local `dist/`. Superseded by 0.2.0 the same day.

Deferred / partial:
- The 106 validator warnings on the roadmap are **content, not parser, warnings** and are accepted as-is: days 1–4 of every week are `learn` (the variety rule fires on >2 in a row) and every day-6 build block is 420 min (the >90-min rule fires). They are the roadmap's own design ("Days 1–4 are 1-hour sessions … Day 6 is the 7-hour build block"). The test pins the count so a validator change is noticed. If Saito wants the variety rule silenced for learn+do days, that is a semantics change (§4) — not done.
- 252 units = 216 working days + 36 rest days. With 7-day availability the projection is 252 calendar days; with weekday-only availability rest units are served on available days, so the plan stretches to ~50 weeks. That is the engine's settled one-unit-per-available-day rule; not changed. The onboarding default (Mon–Fri) was left alone — Saito should pick 6 days for the roadmap's intended pace.
- Week 36 day 7 has a long title ("Rest. You've built and shipped…"); kept verbatim.
- Urdu for the new strings is machine-drafted (A6 still open).
- Repo layout: Keel lives under `keel/` in `mrsaito/studygroup` (the repo root is an unrelated Jekyll site; nothing there was touched). Paths in CLAUDE.md are relative to `keel/`.

Decisions made (with reason):
- **Lazy chunk, not inline, not JSON asset.** Inlining blows the 80 KB entry budget; a `public/` JSON is 163 KB vs 110 KB Markdown and would bypass Vite hashing. A lazy `?raw` chunk keeps first paint small, is content-hashed/immutable, is precached by the SW (offline onboarding proven by smoke), and never loads for learners who paste their own plan.
- **Templates hide validation notes.** A curated template showing 106 notes on the availability step is noise; pasted plans keep them, capped at 3 + count.
- **Sample plan stays inline.** 1.4 KB; a lazy chunk would only add a round trip.
- **A1 folded in** because A8 needs the same alias mechanism; both gates are green.

Exact next command:
```
cd keel/web && ./verify.sh          # A2 next: timer survives backgrounding (CLAUDE.md §6)
```
Still waiting on Saito: the self-use week report (Phase B entry) and the Urdu review (A6).

---

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
