# CLAUDE.md — Keel: operating manual for Claude Code

You are the build agent for Keel. Saito steers asynchronously from a phone;
he will not be watching you work. This file is everything you need to carry
the project from its current state to a sellable v1 without asking questions
you can answer yourself. Read it fully once. Re-read §4 (settled semantics)
before touching the engine, §8 (gates) before every handover.

Repo root files that override your defaults: `PATTERNS.md` (architectural
law), `STACK.md` (environment + failure modes), `SECURITY-BASELINE.md`
(pre-ship floor), `Keel_Product_Blueprint.md` (the product). Where this
file and the blueprint disagree, this file wins — it records decisions made
after the blueprint was written.

---

## 1. What Keel is, in one paragraph

A curriculum runner for goals that take months. A Plan is an ordered list
of Units (learn/build/review/rest). The app shows one unit today; missing a
day shifts the sequence rather than stacking a backlog; weekly buffer units
absorb slippage silently; a rolling 28-day consistency score replaces
streaks; lapses trigger a 10-minute Return unit (3 days), a half-size
re-plan offer (7 days), or a restart/archive prompt (21 days). Never shows
"overdue", never shows a count of missed days, never uses red. Everything
else in the blueprint is secondary to that loop.

## 2. Current state (2026-09-14, session 6)

| Layer | State | Proof |
|---|---|---|
| `engine/` `@keel/engine` 0.1.0 | **Done.** Pure TS, zero runtime deps, 32 tests; `skipped` outcome; weekly review/quiz; Return copy in 6 locales | `cd engine && ./verify.sh` |
| `web/` `@keel/web` 0.2.1 | **Phase A complete + session 6.** Preact+Vite PWA, IndexedDB v2, offline; en + ur/ar/zh/ru/es (drafts, lazy chunks); roadmap template, plan + skip, unit details, multi-unit days, weekly review, file import, backup restore, editable availability, reload-safe timer | `cd web && ./verify.sh` |
| Production | **Live 0.2.1**, public: https://keel-hshahfahad58-2498s-projects.vercel.app/ — Vercel builds from a pinned commit (HANDOVER s5) | curl 200 + sha256 match; smoke vs prod from Termux only |
| Backend / sync / auth / push | **Nothing.** | — |
| Payments, pods, coach, quizzes, calendar | **Nothing.** | — |
| Real 36-week AI Engineer roadmap | **Imported (A8, session 4).** `plans/ai-engineer-36w.json`, 252 units, bundled in onboarding | `engine/verify.sh` roadmap step |

Vercel: team `team_mWaqmzPV6yZRTpvMh8r1crHt`, project `keel`
(`prj_5KF4pViYakmDR5pYLOlR82Vg7fVO`), hobby plan, deployment protection =
preview-only (production public). No custom domain yet.

**The next thing that happens is not code.** Blueprint §12.2: Saito uses the
live app for a week. Until he reports back, do not start Phase B. If he
reports "Today doesn't pull me in", Phase A2 (Today fixes) comes first.

## 3. Repo layout

```
keel/                             ← lives at keel/ inside the mrsaito/studygroup repo
├── CLAUDE.md                     ← this file
├── plans/ai-engineer-36w.json    ← committed roadmap plan (A8)
├── HANDOVER.md                   ← latest session handover (keep updating)
├── Keel_Product_Blueprint.md     ← product spec
├── PATTERNS.md STACK.md SECURITY-BASELINE.md PROJECTS.md
├── engine/                       ← @keel/engine (pure TS, Node ≥22.18)
│   ├── plan.schema.json          JSON Schema 2020-12 for plans
│   ├── src/types.ts              Plan/Unit/Enrollment/Completion/Projection
│   ├── src/dates.ts              YYYY-MM-DD arithmetic, UTC-internal
│   ├── src/validate.ts           errors block; warnings = variety/90-min/no-buffer
│   ├── src/importMarkdown.ts     Markdown roadmap → Plan
│   ├── src/schedule.ts           project(): elastic projection
│   ├── src/consistency.ts        consistency(), lapse()
│   ├── src/review.ts             weekStart(), isReviewDay(), retrievalQuiz()
│   ├── src/recovery.ts           buildReturnUnit(), halveNextTwoWeeks()
│   ├── bin/keel-plan.ts          CLI: import | validate | project
│   ├── test/engine.test.ts       node:test, 25 cases
│   ├── examples/sample-plan.{md,json}
│   └── verify.sh
└── web/                          ← @keel/web (Preact + Vite PWA)
    ├── src/app.tsx               state container, screen switch, derived state
    ├── src/store.ts              IndexedDB: kv + append-only completions
    ├── src/i18n.ts               en + ur string tables (ur = machine draft)
    ├── src/clock.ts              todayLocal() — the only clock
    ├── src/version.ts            APP_VERSION — bump on every release
    ├── src/screens/{Onboarding,Today,Unit,Progress,Settings}.tsx
    ├── src/styles.css            tokens + all styles
    ├── src/sample-plan.md        copy of engine/examples (dedupe: task A1)
    ├── public/{manifest.webmanifest,icon*.{svg,png},vercel.json}
    ├── scripts/build-sw.mjs      generates dist/sw.js (precache + SW_VERSION)
    ├── scripts/verify.mjs        dist assertions incl. 80 KB JS budget
    ├── scripts/smoke.py          Playwright e2e; KEEL_URL=<prod> to run vs prod
    └── verify.sh
```

Commands you will run constantly:
```
cd engine && ./verify.sh                    # engine gate
cd web && ./verify.sh                       # full gate (calls engine gate)
cd web && npm run dev                       # local dev
cd web && npm run build && npx vercel --prod dist   # deploy from Termux (vercel login once)
# or: push the commit, then ask Claude to deploy via the Vercel MCP (builds from the pinned SHA; HANDOVER s5)
KEEL_URL=https://keel-hshahfahad58-2498s-projects.vercel.app/ python3 scripts/smoke.py
node engine/bin/keel-plan.ts import <roadmap.md> > plans/<slug>.json
```

## 4. Settled semantics — do not re-derive, do not silently change

These are encoded in tests. Changing one requires changing its test and
a one-paragraph justification in HANDOVER.md.

**Dates.** `YYYY-MM-DD` strings in the user's local timezone. The engine has
no clock; the client passes `today`. Arithmetic is UTC-internal so DST
can't shift a day. `web/src/clock.ts` is the only `new Date()` for "today".

**Completion outcomes** (append-only, never edited or deleted). Since
session 6 a day may hold more than one `done` row: the Today card still
reads "Done for today", but offers "Do another unit today" for the next
non-buffer unit; each `done` advances and the finish date moves in.
Consistency counts *days with a session*, never units.
- `done` — unit advances; counts as a session.
- `swapped_review` — the learner did a 10-min review instead; counts as a
  session; unit does **not** advance. Return units record this against the
  current plan unit.
- `pushed` — day spent, no session, nothing advances.
- `skipped` — recorded from the Plan screen with a reason; unit advances
  (never served again), not a session, and does **not** spend the day.
- Any `done`/`swapped_review`/`pushed` row dated today makes
  `projection.today === null`; a `skipped` row never does.

**Buffers.** `type: "rest", is_buffer: true`. On schedule → served as a rest
day the learner marks done. Behind → consumed silently, one per deficit
day, removed from the projection. A buffer the learner has moved past
(a later non-buffer unit is done) without marking is consumed forever.

**Deficit** = available days elapsed in [started_at, yesterday] − non-buffer
units done − rest days taken − retro-consumed buffers.

**Consistency** = sessions ÷ planned over a 28-planned-day window ending
yesterday, or ending today once a session is logged today. Rest days taken
are not sessions owed. Sessions on non-available days count, capped at
planned. Known simplification: buffers consumed *inside* the window count
as missed planned days (small under-count; documented, not fixed).

**Lapse** = consecutive missed *available* days counting back from
yesterday; non-available days are skipped, not counted; today never
counts. Tiers: none <3, `return` ≥3, `replan` ≥7, `archive_prompt` ≥21.

**Plan validity.** `seq` contiguous 1-based; stage/week non-decreasing;
every unit has a non-empty `do`; buffers must be `rest`. Warnings (never
block): >2 `learn` in a row, >90 min, a week with no buffer.

**Copy rules.** No red. No "overdue". No missed-day counts anywhere.
Every notification names the next action and its length. The "why" note
appears only in Return, Re-plan and Archive flows.

**Design tokens.** paper `#F7F6F2`, ink `#12262E`, keel `#1F6F78`,
keel-deep `#175A61`, shoal `#D9D2C0` (rest/buffer), tide `#5C7C84`, line
`#E4E0D6`. System font stack only — no webfonts (data cost). One primary
action per screen. The course line is the only progress element on Today.

## 5. Architecture decisions already made

1. **PWA, not Flutter.** Blueprint §6 said Flutter; rejected. Flutter's
   toolchain doesn't run on Termux/ARM, and store distribution forces IAP.
   Preact + Vite PWA, installed to Home Screen. iOS push works ≥16.4 for
   home-screen installs only. Web checkout, no store cut. Not reopened.
2. **Engine is client-agnostic and on-device.** All scheduling runs in the
   browser from local data. The server never computes a schedule; it only
   stores completions/enrollment and sends nudges. `schedule_projection`
   from blueprint §7 is therefore **not a table** — drop it.
3. **Local-first, append-only sync.** `completions` rows carry a client
   UUID + `created_at`; sync = push unseen rows, pull unseen rows, union.
   `enrollment` (plan, availability, intention, why) is last-write-wins on
   `updated_at`. No conflict UI ever.
4. **Plain-Postgres-first.** Schema must run on vanilla PostgreSQL 16.
   Supabase (Auth, RLS helpers, Edge Functions, cron) is the deployment,
   not a dependency of the schema.
5. **Budget $20/month total.** Vercel hobby ($0), Supabase free ($0),
   Web Push via VAPID ($0). The only variable cost is the coach's LLM
   tokens (Phase C) — hard-capped per user in Postgres.
6. **No third-party SDKs in the client** beyond preact. CSP is
   `default-src 'self'`; `connect-src` will add exactly one Supabase
   origin in Phase B. No analytics SDK — product events go to our own
   `events` table.
7. **Verification is scripted or it didn't happen.** Every phase below
   lists its gate. `list_migrations` is unreliable (STACK.md) — verify
   schema via `information_schema` / `pg_policies` with `execute_sql`.

## 6. Roadmap to v1 — phases, tasks, gates

Work strictly in order. Each task ends with its gate green and a
HANDOVER.md entry. Do not begin a phase whose entry condition is unmet.

### Phase A — polish the local loop (entry: now; parallel with Saito's self-use week)

- **A1 Dedupe sample plan. DONE (session 4).** Make `web` import `../engine/examples/sample-plan.md?raw`
  via a Vite alias; delete `web/src/sample-plan.md`. Gate: `web/verify.sh`.
- **A2 Timer survives backgrounding. DONE (session 5).** Store `startedAt` epoch + accumulated
  seconds in component state; compute elapsed on `visibilitychange`. Gate:
  Playwright test that advances the clock 5 min while hidden and asserts
  the display.
- **A3 Weekly review (blueprint §3.6, §5.7, free tier). DONE (session 5).** Friday/Sunday
  prompt: 3 questions (finished / stuck / next week) stored as a
  `reviews` row locally; rule-based retrieval quiz — 3 items drawn from
  `log_text` of completed units older than 7 days, shown as prompts, no
  grading. Gate: unit tests for quiz selection (deterministic seed) +
  smoke path.
- **A4 Plan screen (§5.5). DONE (session 5).** Read-only sequence, grouped by stage/week;
  mark a unit "skipped with reason" → new completion outcome `skipped`
  (advances, not a session; add to engine with tests). Gate: engine tests
  + smoke.
- **A5 Import from file. DONE (session 5).** `<input type=file accept=.md,.json>` alongside
  the paste box. Gate: smoke uploads `sample-plan.md`.
- **A6 Urdu review.** Saito supplies corrected strings; replace the
  machine draft in `i18n.ts` and `recovery.ts`. Gate: a native reader
  signs off in HANDOVER.md. Do not ship Urdu as default until then.
- **A7 Today fixes** (only if the self-use week says so; Saito will state
  what). Gate: smoke.
- **A8 Import the real roadmap. DONE (session 4; see HANDOVER).** When the 36-week file arrives, run
  `keel-plan import`, fix parser warnings, commit `plans/ai-engineer-36w.json`,
  wire it as a bundled template in onboarding ("Use the AI Engineer
  roadmap"). Gate: `keel-plan validate` 0 errors; bundle stays < 120 KB
  (raise the `verify.mjs` limit explicitly, with the reason).

**Phase A exit:** all gates green, APP_VERSION 0.2.0, deployed, smoke vs prod. **Reached in session 5** (A6/A7 remain open on Saito's input; they do not block Phase B).

### Phase B — first backend: auth, sync, push (entry: Saito says "Today works")

- **B1 Supabase project** (free tier). Region closest to Karachi (ap-south-1
  Mumbai). Record project ref and URL in HANDOVER.md; never paste keys.
- **B2 Schema** — one migration file `supabase/migrations/0001_core.sql`,
  plain Postgres:
  ```
  users(id uuid pk = auth.uid(), tz text, locale text, created_at)
  enrollments(id uuid pk, user_id fk, plan jsonb, started_at date,
              availability jsonb, intention jsonb, why text, status text,
              updated_at timestamptz)          -- LWW on updated_at
  completions(id uuid pk /*client uuid*/, user_id fk, enrollment_id fk,
              unit_id text, date date, outcome text check in (done,
              swapped_review, pushed, skipped), minutes int, log_text text,
              created_at timestamptz)          -- append-only: no UPDATE/DELETE grants
  reviews(id uuid pk, user_id, enrollment_id, week_start date,
          finished text, stuck text, next text, created_at)
  push_subscriptions(id uuid pk, user_id, endpoint text unique, p256dh text,
          auth text, ua text, created_at)
  notification_prefs(user_id pk, push bool, quiet_start time, quiet_end time,
          adaptive bool, updated_at)
  events(id bigserial, user_id, name text, props jsonb, at timestamptz) -- §8 metrics
  ```
  RLS on every table: `user_id = auth.uid()` for select/insert;
  `completions`/`events` have no update/delete policy at all. Gate: script
  `supabase/verify.sql` run via `execute_sql`, asserting every table has
  `rowsecurity = true` and the expected policy count in `pg_policies`; plus a
  negative test — a second test user cannot read the first user's rows.
- **B3 Auth.** Email OTP + phone OTP (Pakistan: phone matters). Anonymous
  local use continues to work; sign-in is offered from Settings ("Back up
  and sync"), never forced. Gate: smoke signs in with a Supabase test user
  (service role only in CI env, never in the bundle).
- **B4 Sync.** `web/src/sync.ts`: on sign-in, on app open, on
  `visibilitychange`, and after every write — push local completions
  whose ids the server lacks, pull server rows the client lacks, upsert
  enrollment by `updated_at`. Queue survives offline; retries with backoff;
  never blocks the UI. `connect-src` in `vercel.json` gains the Supabase
  origin. SECURITY-BASELINE: offline queue re-checks the session before
  replaying; expired token → keep queue, prompt re-auth. Gate: Playwright
  test — two browser contexts, same user, complete a unit in one, see it
  in the other after reload; offline queue drains after reconnect.
- **B5 Web Push.** VAPID keys in Supabase Vault (public key in bundle is
  fine). Client subscribes from Settings (opt-in, after a value
  explanation, never on first open). Edge Function `nudge`, run by
  `pg_cron` every 15 min: for each user with push on, compute local time
  from `tz`, send at the intention time if no completion today; second
  nudge +90 min with the 10-minute alternative; never more than two per
  day; respect quiet hours; lapse-tier copy per §3.4. Notification text =
  "After dinner, at your desk: Day 12 — Dictionaries (45 min)". Gate:
  Deno test for the scheduling function with fixed clock; manual receipt
  on the Pixel logged in HANDOVER.md. Adaptive timing (shift toward actual
  completion hour, EMA over 14 days) is B5b, after two weeks of data.
- **B6 Metrics.** Client writes `events` for: `unit_started`, `unit_done`,
  `pushed`, `swapped_review`, `return_started`, `return_done`,
  `replan_accepted`, `notification_opened`. A SQL view per blueprint §8:
  north star, D1/D7/D30/D90, lapse-recovery rate, notification→start.
  Gate: `supabase/metrics.sql` runs and returns rows on seeded data.
- **B7 Account deletion + export** from Settings, server-side cascade.
  Gate: test user deleted → zero rows across all tables.

**Phase B exit:** SECURITY-BASELINE checklist completed line by line in
HANDOVER.md; adversarial pass written; APP_VERSION 0.3.0; deployed;
closed cohort of 20–30 invited (Saito recruits; you produce the invite
copy and a one-page "how to install" with screenshots).

**MVP success criterion (blueprint §9) — measured 8 weeks after cohort
start:** ≥50% of cohort completing ≥3 units/week AND ≥50% lapse-recovery
rate. **If unmet, Phase C is blocked**; fix the core loop instead.

### Phase C — premium (entry: MVP criterion met)

- **C1 Entitlements.** `subscriptions(user_id, tier, source check in
  (web_pk, web_intl), status, renews_at, provider_ref)`. Server-side check
  in every premium Edge Function. Free tier limits enforced client-side
  *and* server-side.
- **C2 Payments.** Instamojo (PKR 499/mo, 3,999/yr) via hosted checkout;
  signed webhook → Edge Function → `subscriptions`. International: Paddle
  or Lemon Squeezy (merchant of record; no Stripe assumptions) at USD
  4.99/34.99. No IAP anywhere — we are not in a store. Gate: webhook
  signature test with a replayed payload; idempotency on duplicate
  delivery.
- **C3 AI coach** (Edge Function, structured outputs, per-user daily
  token budget in Postgres, kill-switch env var, prompts versioned in
  repo). Provider: DeepSeek API first (cost), abstracted so Claude can be
  swapped. Capabilities in order: re-plan negotiation → stuck help scoped
  to the unit's learn/do text → generated Return units → weekly summary.
  Guardrails: cannot mark units done, refuses to complete `is_checkpoint`
  units. Eval set in `coach/evals/*.json` runs in CI: re-plans must respect
  sequence and rest rules; checkpoint refusal ≥ 100%. Coach cost per
  premium user must stay < 20% of subscription price — log tokens per call.
- **C4 Pods** (3–5 members, shared consistency score + current unit, no
  rankings; one-tap templated nudge; Sunday check-in shared). Tables:
  `pods`, `pod_members`, `nudges`. RLS: members read each other's
  consistency score and current unit title only — via a security-definer
  view, never raw completions.
- **C5 Calendar hold** — generate `.ics` per session window (works
  offline, no OAuth). Google Calendar API integration deferred.
- **C6 Analytics screen** (best hour, completion by unit type, projected
  finish history) from local data.

### Phase D — growth (entry: Phase C shipped and paying users exist)

Template library (10 curated plans, editorial QC, every unit ≤90 min),
mentor mode (mentor reads mentee progress/logs, comments on checkpoints),
institutional seats, creator marketplace. Commitment deposits are **last**
and need legal review per market — do not build until Saito confirms
counsel has been consulted.

## 7. Working rules for you

- **One task per session, gate green, handover written.** Never leave a
  half-built task across sessions without a `HANDOVER.md` entry saying
  exactly what is half-built.
- **Bump `APP_VERSION`** on every deploy. The SW hash changes on any byte
  change, but the human-readable version is the release marker.
- **Keep the JS budget.** `verify.mjs` fails above 80 KB. Raising it
  requires a written reason in the commit and in HANDOVER.md.
- **No new runtime dependencies without a licence line in HANDOVER.md.**
  Currently: preact (MIT). Supabase JS client (MIT) is the only expected
  addition. Prefer `fetch` against PostgREST over the SDK if it keeps the
  bundle small — decide in B4 and record.
- **Never echo secrets.** STACK.md incident log: a key was once leaked in
  a debug paste. Redact before printing env, headers, or webhook bodies.
- **i18n:** every user-visible string goes in `i18n.ts` (`en`) and in every
  file under `web/src/locales/` (ur, ar, zh, ru, es — machine drafts marked
  `// draft` until a native reader clears them). `scripts/check-i18n.ts`
  fails the gate on a missing key. Locales are lazy chunks; keep `en` inline.
- **Accessibility floor:** visible focus, labelled controls, no
  colour-only state (cells have `aria-label`), reduced-motion respected.
- **When the blueprint and reality conflict, reality wins and you say so
  in HANDOVER.md.** Partial is labelled partial.

## 8. Gates (run before any handover marked shippable)

```
cd engine && ./verify.sh                                  # must print ALL GATES PASSED
cd web && ./verify.sh                                     # must print ALL GATES PASSED
cd web && KEEL_URL=<prod url> python3 scripts/smoke.py    # after every deploy
# Phase B+: supabase/verify.sql via execute_sql — every table rowsecurity=true,
#           negative cross-user read test fails as expected
SECURITY-BASELINE.md — each checkbox answered in HANDOVER.md, with the
adversarial "how would I break in / lose data" paragraph.
```

## 9. HANDOVER.md template (append a section per session)

```
## Session N — <date> — <task id> <title>
Built: …                              (files, one line each)
Verified: … (paste gate output)
Deployed: yes/no, APP_VERSION, prod URL, smoke-vs-prod result
Deferred / partial: …
Decisions made (with reason): …
Exact next command: …
```

## 10. Open questions for Saito (ask only when you reach the task)

1. ~~A8 — where is the 36-week AI Engineer roadmap file?~~ Received and imported (session 4).
2. A6 — string review: Urdu (Saito) plus Arabic, Chinese, Russian, Spanish (find a reader each).
3. B1 — Supabase org to create the project in.
4. B5 — confirm he received the first push on the Pixel.
5. C2 — Instamojo account details; international MoR choice (Paddle vs
   Lemon Squeezy).
6. D — legal counsel status before commitment deposits.

Everything else, decide yourself, record the decision, and keep moving.
