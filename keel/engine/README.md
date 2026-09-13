# @keel/engine
Pure-TypeScript scheduling engine for Keel. Zero runtime deps. Node ≥ 22.18 or any bundler.

```ts
import { importMarkdown, project, consistency, lapse, buildReturnUnit } from "@keel/engine";
const plan = importMarkdown(md);
const e = { plan, started_at: "2026-09-14", availability: { days: [1,2,3,4,5], minutes_per_day: 45 }, completions: [] };
project(e, "2026-09-14").today;      // Unit for the Today card (or null)
consistency(e, "2026-09-14").percent; // 0–100
lapse(e, "2026-09-14").tier;          // none | return | replan | archive_prompt
```
Verify: `./verify.sh`. CLI: `node bin/keel-plan.ts import|validate|project`.
See ../HANDOVER.md for settled semantics.
