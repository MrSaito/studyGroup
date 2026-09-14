#!/usr/bin/env bash
# Keel web verification gate. Exit 0 = shell is buildable, offline-capable, within data budget.
set -euo pipefail
cd "$(dirname "$0")"
echo "== engine"; (cd ../engine && ./verify.sh | tail -1)
echo "== backend (schema on pglite, nudge scheduler)"; (cd ../supabase && [ -d node_modules ] || npm ci --silent; node test/schema.test.mjs | tail -1; node --test functions/nudge/schedule.test.ts 2>&1 | grep -E "^# (pass|fail)" | tr '\n' ' '; echo)
[ -d node_modules ] || npm ci --silent
echo "== typecheck"; npx tsc --noEmit
echo "== i18n"; node scripts/check-i18n.ts
echo "== build"; npm run build --silent
echo "== dist assertions"; node scripts/verify.mjs
echo "== browser smoke (headless Chromium via Playwright; skipped if unavailable)"
# Each e2e on its own line: under `set -e` a failing left side of `a && b` does NOT exit the script.
if python3 -c "import playwright" 2>/dev/null; then
  python3 scripts/smoke.py
  python3 scripts/e2e-timer.py
  python3 scripts/e2e-sync.py
else
  echo "   playwright not installed — skipped"
fi
echo "== licences"; npx --yes license-checker-rseidelsohn --production --summary 2>/dev/null | sed 's/^/   /'
echo "ALL GATES PASSED"
