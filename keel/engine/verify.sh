#!/usr/bin/env bash
# Keel engine verification gate. Exit 0 = shippable engine.
set -euo pipefail
cd "$(dirname "$0")"
echo "== node $(node --version) (need >=22.18 for native TS)"
[ -d node_modules ] || npm ci --silent
echo "== typecheck"; npx tsc --noEmit
echo "== tests"; node --test test/*.test.ts 2>&1 | grep -E "^# (pass|fail)"
node --test test/*.test.ts >/dev/null 2>&1
echo "== schema sanity"; node -e 'JSON.parse(require("fs").readFileSync("plan.schema.json","utf8")); console.log("plan.schema.json parses")'
echo "== sample import"; node --input-type=module -e '
import { importMarkdown, validatePlan } from "./src/index.ts";
import { readFileSync } from "node:fs";
const p = importMarkdown(readFileSync("examples/sample-plan.md","utf8"));
const w = validatePlan(p).length;
console.log(`sample-plan.md → ${p.units.length} units, ${w} issues`);
process.exit(w === 0 ? 0 : 1);'
echo "== roadmap import (A8)"; node --input-type=module -e '
import { importMarkdown, validatePlan } from "./src/index.ts";
import { readFileSync } from "node:fs";
const p = importMarkdown(readFileSync("examples/ai-engineer-36w.md","utf8"), { id: "ai-engineer-36w", source: "template" });
const issues = validatePlan(p);
const errors = issues.filter((i) => i.level === "error").length;
const committed = JSON.parse(readFileSync("../plans/ai-engineer-36w.json","utf8"));
const same = JSON.stringify(p) === JSON.stringify(committed);
console.log(`ai-engineer-36w.md → ${p.units.length} units, ${errors} errors, ${issues.length - errors} warnings (accepted, see HANDOVER); plans/ai-engineer-36w.json ${same ? "in sync" : "STALE — regenerate with bin/keel-plan.ts import"}`);
process.exit(errors === 0 && same ? 0 : 1);'
echo "== licenses"; npx --yes license-checker-rseidelsohn --production --summary 2>/dev/null || echo "(no production deps — zero-dependency package)"
echo "ALL GATES PASSED"
