#!/usr/bin/env bash
# Copies the engine files the nudge function imports (one source of truth stays engine/src).
# Run before deploying `nudge`; the copies are git-ignored.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p nudge/engine
for f in types.ts dates.ts schedule.ts consistency.ts; do cp "../../engine/src/$f" "nudge/engine/$f"; done
echo "engine files copied into nudge/engine: $(ls nudge/engine | tr '\n' ' ')"
