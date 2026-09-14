#!/usr/bin/env bash
# Keel web verification gate. Exit 0 = shell is buildable, offline-capable, within data budget.
set -euo pipefail
cd "$(dirname "$0")"
echo "== engine"; (cd ../engine && ./verify.sh | tail -1)
[ -d node_modules ] || npm ci --silent
echo "== typecheck"; npx tsc --noEmit
echo "== build"; npm run build --silent
echo "== dist assertions"; node scripts/verify.mjs
echo "== browser smoke (headless Chromium via Playwright; skipped if unavailable)"
if python3 -c "import playwright" 2>/dev/null; then python3 scripts/smoke.py && python3 scripts/e2e-timer.py; else echo "   playwright not installed — skipped"; fi
echo "== licences"; npx --yes license-checker-rseidelsohn --production --summary 2>/dev/null | sed 's/^/   /'
echo "ALL GATES PASSED"
