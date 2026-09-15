# HANDOVER.md — Keel, session 9 (2026-09-15) — cohort kit: invite copy, install guide, week-8 metrics

## Session 9 — 2026-09-15 — Phase B exit deliverable: closed-cohort kit (no app change)
Built:
- `cohort/INVITE.md` — WhatsApp (English + Urdu draft) and email invite copy. Honest scope: closed test, 8 weeks, free, two numbers measured, delete-anytime. Notes for Saito on what to set before sending.
- `cohort/INSTALL.md` — one-page install + first-week guide (Android Chrome / iPhone Safari Home-screen install, setup, daily loop, sign-in, reminders, troubleshooting) with 10 real screenshots in `cohort/img/` (2× PNG) and `cohort/img/web/` (1×, 12–43 KB each, for the shareable page).
- **Shareable page:** https://claude.ai/artifact/1vtcS5GpPzPJfK6TCgN212 — the same guide as one phone-friendly HTML page (Keel's own tokens, system fonts per §4, screenshots embedded, 330 KB). **Private until Saito shares it from the page's share menu.** The invite copy already carries this link.
- `cohort/METRICS.md` — the exact SQL for the weekly check and the **week-8 verdict** (≥50% of the cohort with ≥3 `unit_done` per week over weeks 2–8, and `metrics_lapse_recovery.recovery_pct` ≥ 50), plus sanity queries (events arriving, push on, cron sending). Replace the cohort-start date in the query.
- Screenshots were taken from the 0.3.0 build via the fake backend so the signed-in Reminders section could be captured without a mailbox.

Verified: no code changed; gates untouched (last run session 8: ALL GATES PASSED). Guide page viewed once after publish.

Deployed: n/a (production stays 0.3.0).

Deferred / partial:
- The guide's Android/iPhone "Add to Home screen" steps are text only — OS dialogs cannot be screenshotted headlessly. Saito could add two phone screenshots to `cohort/img/` if the cohort stumbles there.
- Urdu invite is a machine draft (A6 applies).
- Anonymous learners are invisible to the metrics views (events are pushed by sync, which needs sign-in). The invite therefore asks everyone to sign in; if many refuse, add an anonymous events path (local counter → aggregate) before week 8.

Decisions made (with reason):
- **Guide as a private artifact + Markdown in the repo**, not a page on the Vercel site: keeps the app bundle and CSP untouched, and Saito controls who gets the link.
- **Week 1 excluded from the ≥3-units test** (onboarding noise: people join mid-week). Documented in METRICS.md; change the `w >= 1` filter if Saito disagrees.
- **Same tokens, system fonts, single light theme** for the guide — it should look like the app it installs, and the data-cost rule applies to a page opened on Pakistani phones over WhatsApp.

Exact next command:
```
# Saito: (1) Supabase Site URL (HANDOVER s8), (2) share the guide link, (3) send the invite, (4) record the cohort start date here.
# Then nothing to build until the first feedback or the week-8 numbers. Weekly: run the "Weekly check" block in cohort/METRICS.md.
cd keel/web && ./verify.sh
```

---

# HANDOVER.md — Keel, session 8 (2026-09-14) — Phase B LIVE: Supabase project, schema, functions, sync — 0.3.0

## Session 8 — 2026-09-14 — B1 unblocked (invoices settled), B1–B7 live on the real project
**Project:** `keel`, ref **`qwrbevhxtflmwkmueqmw`**, org "Abdul's Den" (Pro; **$10/month** for this project), region **ap-south-1 (Mumbai)**, URL `https://qwrbevhxtflmwkmueqmw.supabase.co`. Publishable key `sb_publishable_L4QC…` is in `web/src/config.ts` (public by design). No secret is in the repo: the VAPID private key, VAPID public key and the cron shared secret live only in **Supabase Vault**; the local file they were generated into was deleted.

Done on the live project, in order, each verified:
1. `apply_migration 0001_core` → `verify.sql` via execute_sql: **all 8 tables ok** (RLS on, exact policy counts, append-only).
2. `apply_migration 0003_metrics` (4 views, revoked from API roles).
3. Vault: 3 secrets created via plain SQL (not via a migration — migration bodies are stored in the DB). `apply_migration 0002_secrets_cron`: pg_cron + pg_net enabled, `public.get_secret()` (service role only), cron job **`keel-nudge` every 15 min** → pg_net → the function with the shared-secret header.
4. Edge Functions deployed: **`nudge`** (verify_jwt=false, guarded by the Vault secret; 7 files incl. the engine copies) and **`delete-account`** (verify_jwt=true).
5. `web/src/config.ts` filled; `public/vercel.json` CSP `connect-src` += the project origin; **`captureSessionFromHash()`** added so the magic link in Supabase's default email works (the code path also works once `{{ .Token }}` is in the template); OTP requests carry `redirect_to` = the app.
6. **Live check (`web/scripts/live-check.mjs`, Node through the proxy, two SQL-created test users): 17/17** — sign-in, insert, own read, UPDATE/DELETE on completions → 403, insert owned by another user → 403, cross-user reads → 0 rows, cross-user UPDATE → 0 rows, users row isolation, events write-only, delete-account → 200 and the token dies, nudge dry run 200, wrong secret → 403. Test users deleted afterwards.
7. **Nudge dry run with a seeded learner** (3-unit plan, reminder at the current Karachi minute): `{"considered":1,"results":[{"kind":"first","title":"After dinner, at your desk","body":"Day 1 of 3 — Dictionaries (45 min)","delivered":0,"dryRun":true}]}` — the engine copy inside the function projects the plan, sees the day unspent, applies the intention copy. Delivered 0 because the test user has no push subscription (that is the Pixel step).
8. Full web gate with the real config: ALL GATES PASSED (schema on pglite, scheduler tests, smoke, timer e2e, sync e2e). Entry JS 69.2 KB. `verify.mjs` secret scan narrowed to real secret shapes (the public URL/key are allowed; JWTs, `sb_secret_`, service_role, private keys are not).
9. **APP_VERSION 0.3.0** (Phase B exit marker).

Deployed: **yes — 0.3.0 live** at https://keel-hshahfahad58-2498s-projects.vercel.app/ (deployment `dpl_7G5PxerqyVLaoHtEkAPKaJ4BxLTU`, built by Vercel from commit `4c49f99`). All 16 production files sha256-equal to the gated local `dist/`; `SW_VERSION = "0.3.0-ae62df07"`; CSP `connect-src 'self' https://qwrbevhxtflmwkmueqmw.supabase.co` served. The app now talks to the live project: Settings → Back up and sync shows the email sign-in.

**Saito — three things only you can do (dashboard, ~5 minutes):**
- Auth → URL Configuration → **Site URL** = `https://keel-hshahfahad58-2498s-projects.vercel.app` and add it to **Redirect URLs**. Until then the magic link in the sign-in email lands on `localhost:3000` and sign-in fails. (The Management API for this needs a personal access token the MCP does not have.)
- Optional but better: Auth → Email Templates → Magic Link: add a line with `{{ .Token }}` so the email also carries the 6-digit code (the app accepts either).
- Then on the Pixel: Settings → Back up and sync → sign in; Settings → Reminders → set the time to a few minutes ahead → Turn reminders on; wait for the push. **Log the receipt here (B5 gate).** If nothing arrives within 20 min, run `select * from cron.job_run_details order by start_time desc limit 5` and `select * from public.nudges` via execute_sql and send me the output.
- Phone OTP: needs an SMS provider (Twilio/MessageBird) configured under Auth → Providers → Phone. Not done; the client has the calls ready.

SECURITY-BASELINE (CLAUDE.md §8; the standalone file was never in the tarball, so this is the checklist as CLAUDE.md states it):
- RLS on every table, `user_id = auth.uid()`: **yes**, verified live and on pglite. Completions/events have no UPDATE/DELETE policy **and** grants revoked: yes (403 live).
- Negative cross-user read test: **yes**, live (0 rows) and pglite.
- Offline queue re-checks the session before replaying; expired token → keep queue, prompt re-auth: yes (`freshSession` → `AuthExpired` → status "reauth", queue untouched; e2e covers offline→online drain).
- No secrets in the bundle or repo: yes (scan in `verify.mjs`; Vault for server secrets; secrets file deleted).
- CSP: `default-src 'self'; connect-src 'self' <project origin>`; no third-party SDK: yes.
- Service worker caches same-origin GET only; API calls never cached: yes.
- Adversarial pass — how would I break in or lose data? (a) Steal the publishable key → you get exactly what an anonymous browser gets: nothing without a JWT; RLS scopes every row. (b) Steal a user's JWT → their rows, for ≤1 h; refresh tokens rotate; sign-out revokes. (c) Forge a completion for another user → 403 (tested). (d) Replay a push subscription → server sends to that endpoint only; endpoints are unique and user-scoped; 404/410 pruned. (e) Call `nudge` directly → 403 without the Vault secret (tested); pg_cron is the only caller. (f) Call `get_secret` from the API → revoked from anon/authenticated. (g) Delete-account via a stolen JWT → yes, that is the one destructive action a live token allows; acceptable (confirm dialog; it is the user's own data). (h) Lose data: completions are append-only on both ends, IndexedDB is the source of truth, sync is union-by-id, restore-from-backup exists. (i) Enrollment LWW can drop an edit made on a device that was offline longer than another device's newer edit — accepted, documented in §5.3 ("no conflict UI ever"). Open: device-side IndexedDB unencrypted (accepted since session 2); no rate limiting beyond Supabase defaults; `events` has no size cap per user (add a cron trim in Phase C).

Decisions made (with reason):
- **Secrets via execute_sql, not apply_migration** — migration SQL is persisted in `supabase_migrations.schema_migrations`; a secret there would be a secret in the DB history.
- **Dry-run mode ignores the time window** so the engine path can be exercised at any minute; the real path still enforces the 15-minute window (scheduler tests).
- **Magic-link capture** rather than waiting on a template edit: works with the default email today; the code path stays for when the template carries the token.
- **Vault secret read through a security-definer function** because PostgREST does not expose the vault schema.
- **Test users by SQL insert into auth.users** (documented Supabase pattern) so the live check needs no mailbox; both deleted afterwards.

Exact next command:
```
# After Saito sets Site URL and logs the push receipt: Phase B exit is complete. Then: cohort invite copy + install one-pager (CLAUDE.md Phase B exit),
# and the MVP criterion clock starts at cohort start. Phase C stays blocked until the criterion is measured.
cd keel/web && ./verify.sh
```

---

# HANDOVER.md — Keel, session 7 (2026-09-14) — Phase B built and gated locally; B1 blocked on billing

## Session 7 — 2026-09-14 — "Go B": B1 blocked, B2–B7 built, every gate that can run without a live project is green
**Blocker (needs Saito):** `create_project` in org "Abdul's Den" (the only org; Pro plan, new project = **$10/month**, inside the $20 ceiling) was refused: *"There are overdue invoices in the organization. Settle the invoices before creating a new project."* Two ways out: settle the invoices, or create a new free-tier org in the Supabase dashboard and tell me its name. Region will be ap-south-1 (Mumbai). Nothing below touches a live project until then.

Built (all gated locally):
- **B2 schema — `supabase/migrations/0001_core.sql`.** Plain Postgres: users (mirror of auth.users via trigger; tz, locale), enrollments (LWW on updated_at), completions + reviews + events (append-only: no UPDATE/DELETE policy *and* grants revoked), push_subscriptions, notification_prefs, nudges (service role only). RLS on all 8 tables, `user_id = auth.uid()`. `supabase/verify.sql` is the gate query (run via execute_sql on the live project too). **Local gate:** `supabase/test/schema.test.mjs` applies the migration to **pglite (WASM Postgres 18)** with a 6-line shim for what Supabase provides, then asserts: RLS + exact policy counts on every table; UPDATE/DELETE on append-only tables → permission denied; A cannot insert a row owned by B; **B reads zero of A's rows across enrollments/completions/users**; B's UPDATE of A's row affects 0 rows; deleting the auth user cascades to 0 rows; all four metrics views return rows on seeded events. 21/21 assertions.
- **B3 auth — `web/src/auth.ts`.** GoTrue over `fetch`, no SDK (decision below): email OTP request/verify, refresh with the expired-token rule from SECURITY-BASELINE (queue kept, "Sign in again" shown), sign-out. Phone OTP functions exist but the UI offers email only until an SMS provider is configured in the project (B3 note). Sign-in lives in Settings ("Back up and sync", optional, never forced) and in onboarding ("I already use Keel on another phone") so a second device pulls its plan instead of creating a new one.
- **B4 sync — `web/src/sync.ts`.** completions/reviews: push rows the server lacks (ids tracked in `kv.sync`, `Prefer: resolution=ignore-duplicates` for idempotency), pull rows the client lacks (inclusive created_at cursor, dedup by id), union. Enrollment: one active per user, LWW on updated_at; a different newer remote row is adopted, a different older one is archived. Events: push and forget. Triggers: app open, sign-in, visibilitychange, `online`, and 1.5 s after every write. Retries back off 2 s → 5 min. Never blocks the UI; status shown in Settings. `EnrollmentRecord` gained `id` + `updated_at` (older local records get them on first load). IndexedDB **v3** (events store).
- **B4 gate — `web/scripts/e2e-sync.py`** against **`web/scripts/fake-supabase.py`**, an in-memory stand-in for the exact GoTrue/PostgREST endpoints the client uses, scoped per bearer like RLS: A onboards, signs in, completes a unit → on server; B (fresh device) signs in from onboarding → gets A's plan and history; B goes **offline**, skips a unit → status "offline", server unchanged; B online → queue drains; A reloads and sees B's skip; C (another user) sees nothing of A's; A deletes the account → zero server rows, local wiped.
- **B5 push.** Client `web/src/push.ts` (opt-in from Settings after the value line; subscribes; posts subscription + prefs); SW gets `push` and `notificationclick` handlers (opens `./?from=push` → `notification_opened` event). Server: `supabase/functions/nudge/` — `schedule.ts` is the **pure decision** (send-time window, +90 min second nudge with the 10-minute option, max two/day, quiet hours wrapping midnight, lapse-tier copy, never "overdue"/miss counts) with **6 node:test cases on a fixed clock**; `index.ts` (Deno) computes local time per user from `tz`, reuses the engine's `project()/daySpent()/lapse()` (copied by `functions/deploy.sh`), sends via `npm:web-push`, logs to `nudges`, drops 404/410 subscriptions. `migrations/0002_secrets_cron.sql`: `get_secret()` (service role only, reads Vault), pg_cron every 15 min → pg_net → the function with a shared secret header. Adaptive timing (B5b) not started.
- **B6 metrics — `supabase/metrics.sql`.** Views: north star (learners with ≥3 unit_done per week), D1/D7/D30/D90 retention, lapse-recovery rate, notification→start within 60 min. Client `web/src/events.ts` queues the §8 event names (+ `unit_skipped`, `review_saved`, `signed_in`); revoked from anon/authenticated.
- **B7 — `supabase/functions/delete-account/`** (verify_jwt: caller's JWT → admin delete of the auth user → every table cascades). Settings: "Delete my account" (confirm → function → sign out → local wipe).
- Bundle: backend code + account UI are **lazy chunks** (entry 68.8 KB of 80). `web/src/config.ts` holds `__SUPABASE_URL__` / `__SUPABASE_ANON_KEY__` / `__VAPID_PUBLIC_KEY__` placeholders; until filled, Settings shows "coming in the next release" and nothing network-related runs. A loopback-only override lets the e2e point at the fake backend.
- Bugs found by the new gates: (1) pull cursor used `>`; two rows in the same millisecond (or a pinned clock) were skipped — now `>=` + id dedup; (2) typing a log and tapping Done in the same instant could save without the log (state lagged a render) — now read through a ref. Both would have hit real users.
- 30 new strings × 6 locales (drafts). `web/verify.sh` now runs the schema test, the scheduler tests and the sync e2e. **APP_VERSION 0.2.2** (fixes above; backend still off in prod).

Verified:
```
$ cd engine && ./verify.sh          # pass 32 / fail 0 · ALL GATES PASSED
$ cd supabase && npm test           # SCHEMA TESTS PASSED (21/21 on pglite) · nudge scheduler: pass 6 / fail 0
$ cd web && ./verify.sh
== dist assertions  entry JS 68.9 KB (limit 80 KB), lazy Account 4.3 · backend 9.5 · ai-engineer-36w 109.6 · locales 5.3–8.7 KB
== browser smoke    SMOKE PASSED (all session-6 paths)    · TIMER E2E PASSED
== sync e2e         A signed in → server; B pulled plan+history; B offline skip queued; B online drained; A sees it; C isolated; A deleted → 0 rows
                    SYNC E2E PASSED (3 consecutive runs)
ALL GATES PASSED
```

Deployed: **yes — 0.2.2 live** at https://keel-hshahfahad58-2498s-projects.vercel.app/ (deployment `dpl_6xsfFkDxjp5Te5SEUSmrqQMSPypc`, built by Vercel from commit `b520a2a`). All 16 production files sha256-equal to the gated local `dist/`; `SW_VERSION = "0.2.2-2781ab68"`. Backend placeholders unfilled, so production shows "coming in the next release" under Settings → Back up and sync and makes no network calls; the lazy backend chunk is precached but never executed. (GitHub returned 503 on four consecutive pushes this session; the fifth succeeded — nothing to do, noting it for the record.)

Decisions made (with reason):
- **No Supabase SDK.** supabase-js is ~30 KB gzipped against a 80 KB entry budget; the client needs five auth endpoints and PostgREST CRUD. `fetch` it is (CLAUDE.md B4 asked for exactly this call). Licence line: no new runtime dependency; **dev-only**: `@electric-sql/pglite` (Apache-2.0) in `supabase/`, and `npm:web-push` (MIT) inside the Edge Function only.
- **Schema proven on vanilla Postgres before any project exists** (pglite) — this is the "Plain-Postgres-first" rule made testable; the same `verify.sql` runs on the live project afterwards.
- **Fake backend for the e2e, real backend for a Node check later.** Headless Chromium cannot reach Supabase from this sandbox (proxy), and a real two-device test needs a mailbox for OTP. The fake enforces the same per-user boundary; the RLS itself is proven by the pglite test and will be re-run live.
- **Secrets never in the repo.** VAPID keys + cron secret go into Vault at deploy time by hand (steps below); `config.ts` carries only public values.
- **Timezone from the device** (`Intl` resolved tz) pushed to `users.tz` at sign-in/locale change; the nudge function trusts it.

Exact next commands (when the project exists — in this order):
```
1. create_project (name keel, ap-south-1) → record ref + URL here, never keys.
2. apply_migration 0001_core (from supabase/migrations/0001_core.sql); execute_sql supabase/verify.sql → every row ok=true;
   execute_sql: create two test users (SQL insert into auth.users/identities), run the same cross-user checks as test/schema.test.mjs.
3. execute_sql supabase/metrics.sql.
4. Vault: generate VAPID keys (node: crypto ECDH P-256 → base64url) → vault.create_secret ×3 (vapid_private_key, vapid_public_key, nudge_cron_secret).
   apply_migration 0002_secrets_cron with __PROJECT_REF__ substituted.
5. cd supabase/functions && ./deploy.sh; deploy_edge_function nudge (verify_jwt=false, files: index.ts, schedule.ts, engine/*.ts) and delete-account (verify_jwt=true).
   Call nudge with ?dry=1 and the secret → JSON with considered/results.
6. web/src/config.ts: url, anon key (get_publishable_keys), VAPID public key. public/vercel.json connect-src += the project origin.
7. Auth settings in the dashboard: enable email OTP (default), set OTP length 6, site URL = the Vercel URL; phone provider optional.
8. ./verify.sh, APP_VERSION 0.3.0, commit, deploy, sha256 check, sign in on the Pixel, enable reminders, log the first push receipt here (B5 gate).
```

---

# HANDOVER.md — Keel, session 6 (2026-09-14) — languages ×4, multi-unit days, details, convenience — 0.2.1

## Session 6 — 2026-09-14 — Saito's ask: zh/ar/ru/es, several units a day, see past & upcoming units, "features that sell"
Built:
- **Languages.** `web/src/i18n.ts` keeps English inline and loads every other locale as a lazy chunk (`web/src/locales/{ur,ar,zh,ru,es}.ts`, 4–6 KB each). Arabic and Urdu are RTL. `DAY_LABELS`, `DATE_LOCALE`, `LOCALES` live in i18n; the onboarding toggle and Settings are a 6-way `<select>`; non-English shows "This translation is a draft" under the picker. Engine `recovery.ts` (Return unit copy) gained ar/zh/ru/es tables. **All five non-English tables are machine drafts** (each file header says so) — native review before any is promoted beyond "available". New gate `scripts/check-i18n.ts`: every locale covers every English key, no extras, no empties; English checked against the copy rules.
- **Multi-unit days.** Today's "Done for today" card offers "Do another unit today" (not for rest/buffer units). Each `done` row advances; the projection already lays remaining units from tomorrow, so the finish date moves in by a day. Consistency still counts *days with a session* (two units today = one session-day). Engine test pins it.
- **Unit details.** `web/src/screens/UnitDetail.tsx` — any unit from a Plan row (tap the title) or a Progress cell (cells are now buttons): learn/do/tip/deliverable; past → "Done on <date> · N min logged" and the log text (plus any 10-min review notes); skipped → the reason; upcoming → "Planned for <date>"; current → Start.
- **Settings became useful.** Edit working days, minutes/day and the cue (after/at) with Save; **Restore from a backup file** (the Export JSON; validated with `assertPlan` + row-shape checks, confirm dialog, replaces everything); **Start a new plan** (fills the gap the "Plan complete" copy promised); language picker.
- **Progress:** "This week: N sessions · M min". **Plan:** opens scrolled to the current unit (252 rows).
- `web/src/store.ts` — `restore()`; `Settings.locale` widened. `web/verify.sh` — second error-swallowing bug fixed (a failing `a && b` inside `if` does not trip `set -e`; each e2e now on its own line).
- Bug found by the new smoke path and fixed: the draft-log debounce could write the timer back **after** Done cleared it, so a reload reopened a finished unit. Pending write is cancelled on Done/unmount, and a stale timer for an already-advanced unit is discarded on load.
- `web/src/version.ts` — **APP_VERSION 0.2.1**. Engine: 32 tests.

Verified:
```
$ cd engine && ./verify.sh                      # pass 32 / fail 0 · ALL GATES PASSED
$ cd web && ./verify.sh
== i18n            ur ar zh ru es: 111/111 strings each
== dist assertions dist OK: 13 precached, entry JS 62.7 KB (limit 80 KB), lazy ai-engineer-36w 109.6 KB, ar 5.2, es 4.1, ru 6.1, ur 5.3, zh 3.8 KB (limit 120 KB each)
== browser smoke   Today · Persisted · Do another: Day 3 of 10 … Finish by 24 Sept | was: 25 Sept
                   Detail (past): Done on 14 Sept · 1 min logged · Plan: skipped unit 4 · Progress 10/2 done/1 skipped · This week: 1 sessions
                   Detail (upcoming): Planned for 17 Sept · Weekly review saved · Languages: ur ar zh ru es OK (rtl: ur ar)
                   Availability edited: Saturday on, persisted · Offline reload OK · Roadmap offline: Day 1 of 252
                   Backup restored: Lists and dictionaries | done cells: 1 · File import: 10 units · SMOKE PASSED
                   Hidden 5 min → 34:50 · After reload → 34:47 | log restored · TIMER E2E PASSED
ALL GATES PASSED
```

Deployed: **yes — 0.2.1 live** at https://keel-hshahfahad58-2498s-projects.vercel.app/ (deployment `dpl_HEVs1mfm66oue9Nc8q84nRfBY6tF`, built by Vercel from commit `feed5f9`). Verified from the sandbox: all 14 production files (entry, roadmap chunk, five locale chunks, css, html, sw, manifest, icons) sha256-equal to the local `dist/` that passed the gate; `SW_VERSION = "0.2.1-060202c3"` served; CSP / DENY headers present; assets immutable. Existing installs pick it up on next open (SW hash changed). Smoke vs prod: from Termux.

Decisions made (with reason):
- **§4 changed — multi-unit days.** Was: one unit per day, full stop. Now: a completion row dated today still makes `projection.today === null` (the card says "Done for today"), but the learner may open the next non-buffer unit and each `done` advances. Justification: Saito asked for it; the elastic schedule was already symmetric in the engine (deficit floors at 0, remaining units lay out from tomorrow), so the change is UI + one test, and the blueprint's anti-cramming intent is kept by (a) never offering a rest/buffer unit early, (b) consistency counting session-days not units, so binge days do not inflate the score.
- **Lazy locale chunks, English inline.** Six inline tables would have put the entry over 80 KB; a language is loaded once and cached. First paint is always English until settings load (milliseconds, from IndexedDB).
- **Drafts shipped as "available", flagged in-app.** A visible "this translation is a draft" line is more honest than hiding four languages until reviewers appear; the check-i18n gate guarantees no English falls through as a blank.
- **Restore validates before it wipes.** `parseBackup` runs `assertPlan` and row-shape checks first; a bad file leaves the device untouched.
- **Not built, deliberately:** dark mode (changes the design tokens in §4 — Saito's call), editing past logs (completions are append-only by design), calendar `.ics` (C5, premium), push (Phase B).

Deferred / partial:
- Native review of ur/ar/zh/ru/es (A6 now covers five languages). Urdu remains the only one Saito can check himself.
- Editing availability re-scores history under the new days (consistency/lapse read current availability). Documented, accepted: the score is a 28-day window and recovers on its own.
- Progress cells as buttons are 22 px targets; fine for a fingertip, tight for tremor — revisit with the A7 Today fixes if Saito notices.

Exact next command:
```
cd keel/web && ./verify.sh      # nothing queued: Phase B waits on "Today works"; A6 waits on reviewers.
```

---

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
