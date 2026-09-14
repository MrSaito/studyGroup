# Keel
A curriculum runner for goals that take months. See `Keel_Product_Blueprint.md`.
- `engine/` — pure-TS scheduling engine (`./verify.sh`)
- `web/`    — Preact/Vite offline-first PWA (`./verify.sh`, then `npx vercel --prod dist`)
- `supabase/` — schema (plain Postgres + RLS), metrics views, Edge Functions; `npm test` runs on pglite
- `plans/`  — committed plan JSON (`ai-engineer-36w.json`, the bundled 36-week roadmap)
Operating manual for the build agent: `CLAUDE.md`. Latest handover: `HANDOVER.md` (session 8: Phase B live on Supabase project qwrbevhxtflmwkmueqmw).
