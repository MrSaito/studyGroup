// Every locale must cover every English key, and carry no key English lacks.
// Also the copy rules from CLAUDE.md §4: no "overdue", no miss counts (checked on en).
import { en, LOCALES } from "../src/i18n.ts";
const BRAND = new Set(["appName"]); // never translated
const keys = Object.keys(en).filter((k) => !BRAND.has(k));
let bad = 0;
for (const { code } of LOCALES) {
  if (code === "en") continue;
  const m = await import(`../src/locales/${code}.ts`);
  const t = m.default as Record<string, string>;
  const missing = keys.filter((k) => !(k in t));
  const extra = Object.keys(t).filter((k) => !keys.includes(k));
  const empty = Object.entries(t).filter(([, v]) => typeof v !== "string" || v.trim() === "").map(([k]) => k);
  if (missing.length || extra.length || empty.length) { bad++; console.error(`${code}: missing=${missing} extra=${extra} empty=${empty}`); }
  else console.log(`${code}: ${Object.keys(t).length}/${keys.length} strings`);
}
for (const [k, v] of Object.entries(en)) if (/overdue|missed \d|days missed|streak/i.test(v)) { bad++; console.error(`en.${k} breaks the copy rules: ${v}`); }
process.exit(bad ? 1 : 0);
