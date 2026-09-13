#!/usr/bin/env node
// CLI: convert a Markdown roadmap to Keel plan JSON, or validate a JSON plan.
//   node bin/keel-plan.ts import roadmap.md [--id=slug] [--source=template|import] [--locale=en] > plan.json
//   node bin/keel-plan.ts validate plan.json
//   node bin/keel-plan.ts project plan.json 2026-09-14 [days=1,2,3,4,5] [minutes=45]
import { readFileSync } from "node:fs";
import { importMarkdown, validatePlan, assertPlan, project, type Weekday } from "../src/index.ts";

const [cmd, file, ...rest] = process.argv.slice(2);
function die(msg: string): never { console.error(msg); process.exit(2); }
if (!cmd || !file) die("usage: keel-plan <import|validate|project> <file> [args]");

if (cmd === "import") {
  const flag = (name: string) => rest.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const source = flag("source");
  if (source && source !== "template" && source !== "import" && source !== "coach") die(`--source must be template|import|coach, got ${source}`);
  const plan = importMarkdown(readFileSync(file, "utf8"), { id: flag("id"), source: source as "template" | "import" | "coach" | undefined, locale: flag("locale") });
  const warnings = validatePlan(plan).filter((i) => i.level === "warning");
  for (const w of warnings) console.error(`warning: ${w.path} ${w.message}`);
  process.stdout.write(JSON.stringify(plan, null, 2) + "\n");
} else if (cmd === "validate") {
  const issues = validatePlan(JSON.parse(readFileSync(file, "utf8")));
  for (const i of issues) console.log(`${i.level}: ${i.path} ${i.message}`);
  const errors = issues.filter((i) => i.level === "error").length;
  console.log(`${errors} error(s), ${issues.length - errors} warning(s)`);
  process.exit(errors ? 1 : 0);
} else if (cmd === "project") {
  const today = rest[0] ?? die("project needs <today YYYY-MM-DD>");
  const days = (rest.find((a) => a.startsWith("days="))?.slice(5) ?? "0,1,2,3,4,5,6").split(",").map(Number) as Weekday[];
  const minutes = Number(rest.find((a) => a.startsWith("minutes="))?.slice(8) ?? 45);
  const plan = assertPlan(JSON.parse(readFileSync(file, "utf8")));
  const p = project({ plan, started_at: today, availability: { days, minutes_per_day: minutes }, completions: [] }, today);
  console.log(`${p.position}\nprojected finish: ${p.projected_finish}`);
  for (const it of p.items.slice(0, 14)) console.log(`${it.date}  #${it.unit.seq}  ${it.unit.type.padEnd(6)} ${it.unit.est_minutes}m  ${it.unit.title}`);
  if (p.items.length > 14) console.log(`… ${p.items.length - 14} more`);
} else die(`unknown command ${cmd}`);
