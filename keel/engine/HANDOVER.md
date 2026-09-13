# HANDOVER.md — Keel, session 1 (2026-09-14)

## What was built
`engine/` — `@keel/engine` v0.1.0. Pure TypeScript, **zero runtime
dependencies**, runs natively on Node ≥ 22.18 (no build step) and inside a
PWA unchanged. It is the whole of Blueprint §3.1, §3.3, §3.4 and the free
tier of §3.6/§3.7 recovery, as a library the client calls.

| File | Blueprint § | What it does |
|---|---|---|
| `plan.schema.json` | 3.1, 7 | Interchange contract for plans (JSON Schema 2020-12) |
| `src/types.ts` | 3.1, 7 | Plan/Unit/Enrollment/Completion types |
| `src/validate.ts` | 3.1, 3.6, 11.2 | Errors block import; warnings = variety rule (>2 learn in a row), >90-min units, weeks without a buffer |
| `src/importMarkdown.ts` | 3.1 | Markdown roadmap → Plan (format documented in file header + `examples/sample-plan.md`) |
| `src/schedule.ts` | 3.3 | Elastic projection: one unit per available day, a miss shifts by one, buffers consumed silently, projected finish, `position` string for the Done animation |
| `src/consistency.ts` | 3.4 | Rolling-28-day consistency score; lapse detection at 3/7/21 missed *available* days |
| `src/recovery.ts` | 3.4 | Templated 10-min Return unit (en + ur); half-size two-week re-plan |
| `bin/keel-plan.ts` | 12.1 | CLI: `import` md→json, `validate`, `project` |
| `test/engine.test.ts` | — | 25 tests encoding the blueprint's stated behaviours as assertions |
| `verify.sh` | — | Gate: typecheck + tests + schema + sample import + licence check |

### Semantics settled this session (referenced by the app, don't re-derive)
- **Completion outcomes:** `done` advances the unit and is a session.
  `swapped_review` is a session but does *not* advance. `pushed` spends the
  day, no session. All three make `today` null on the Today card.
- **Buffers:** `type=rest, is_buffer=true`. On time → served as a rest day
  (learner marks it done). Behind → consumed silently, one per deficit day.
  A buffer the learner has moved past without marking is treated as
  consumed forever (no resurrection).
- **Deficit** = available days elapsed since start − non-buffer units done −
  rest days taken − retro-consumed buffers.
- **Consistency** window is 28 planned days ending yesterday, or ending today
  once a session is logged today (an unfinished day is never a miss). Rest
  days taken are not sessions owed.
- **Lapse** counts consecutive missed *available* days back from yesterday;
  non-available days are skipped, not counted. Tiers: none / return (≥3) /
  replan (≥7) / archive_prompt (≥21).
- **Dates** are `YYYY-MM-DD` strings in the user's local tz; the engine has
  no clock. The client passes `today`. All arithmetic is UTC-internal so DST
  cannot shift a day.

## Verification (run and passed)
```
$ cd engine && ./verify.sh
== node v22.22.2 (need >=22.18 for native TS)
== typecheck
== tests
# pass 25
# fail 0
== schema sanity
plan.schema.json parses
== sample import
sample-plan.md → 10 units, 0 issues
== licenses
└─ MIT: 1          (the package itself; no production deps)
ALL GATES PASSED
```

## Architecture decision made this session — Flutter is out
Blueprint §6 specifies Flutter. **Rejected**, one paragraph per PATTERNS
preamble: the Flutter toolchain does not run on Termux/ARM Android, so every
build would be a cloud CI round-trip Saito cannot steer from the phone, and
Android/iOS store distribution forces Play Billing / IAP (30% + RevenueCat +
the §4 "payment reality" contortions). A Preact + Vite PWA (PATTERNS §1, §6;
STACK default) runs offline, ships push notifications on Android and on iOS
≥16.4 when installed to Home Screen, and sells subscriptions through plain
web checkout (Instamojo/JazzCash) with no store cut and no policy risk.
Cost: no App Store discoverability and iOS push only for home-screen
installs. Accepted. Section 6 of the blueprint should be rewritten to:
Preact/Vite PWA + IndexedDB (Dexie) + this engine on-device; Supabase for
auth/sync/push fan-out; Vercel static hosting. The engine was written to
be client-agnostic, so this decision cost nothing.

## Deferred (not started)
- **Converting the actual 36-week AI Engineer roadmap.** The roadmap file
  was not in this session. The importer's Markdown convention is *my*
  convention (see file header); it may need one pass of regex adjustment
  once the real file is seen. Run
  `node bin/keel-plan.ts import <roadmap.md>` and read the warnings.
- Urdu strings in `recovery.ts` are machine-drafted placeholders — native
  review required before ship.
- Consistency score ignores buffers consumed *within* the window (a
  consumed buffer day counts as a missed planned day). Small, systematic
  under-count; documented, not fixed.
- Multi-unit days (packing two short units when `minutes_per_day` allows)
  — blueprint says one unit per day; kept that.
- Everything client-side: Today/Unit/Progress screens, IndexedDB store,
  service worker, notifications, sync. Everything backend.
- SECURITY-BASELINE not run — nothing shippable to a user exists yet;
  the engine has no I/O surface.

## Exact next command
```
cd keel/engine && ./verify.sh && node bin/keel-plan.ts import /path/to/ai-engineer-roadmap.md > ../plans/ai-engineer-36w.json
```
Then session 2 = Vite + Preact shell with Today/Unit/Progress against
IndexedDB only (Blueprint §12.2), wiring `project()` / `consistency()` /
`lapse()` / `buildReturnUnit()` from this package. Use it yourself for a
week before any sync code.
