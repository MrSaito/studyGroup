// B2 gate, locally: apply migrations/0001_core.sql to a vanilla Postgres (pglite, WASM)
// with a minimal shim for what Supabase provides (auth.users, auth.uid(), the API roles),
// then assert: RLS on every table with the expected policy count; append-only tables
// reject UPDATE/DELETE; a second user cannot read the first user's rows; metrics views run.
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const migration = readFileSync(new URL("migrations/0001_core.sql", root), "utf8");
const verifySql = readFileSync(new URL("verify.sql", root), "utf8");
const metricsSql = readFileSync(new URL("metrics.sql", root), "utf8");
const db = new PGlite({ extensions: { pgcrypto } });
let failed = 0;
const ok = (cond, msg) => { if (cond) console.log("  ok   " + msg); else { failed++; console.error("  FAIL " + msg); } };
const run = async (sql) => { for (const s of sql.split(/;\s*\n/).map((x) => x.trim()).filter(Boolean)) await db.exec(s); };

// --- shim: what Supabase provides out of the box ---
await run(`
create extension if not exists pgcrypto;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role`);

// --- migration must apply on plain Postgres, statement by statement ---
// (functions/policies contain ';' inside $$ bodies: split on the "-- ---" section markers safely by using a smarter splitter)
function statements(sql) {
  const out = []; let cur = ""; let inDollar = false;
  for (const line of sql.split("\n")) {
    if (line.trim().startsWith("--")) continue;
    const dollars = (line.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    cur += line + "\n";
    if (!inDollar && line.trim().endsWith(";")) { out.push(cur.trim()); cur = ""; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
for (const s of statements(migration)) await db.exec(s);
console.log("migration applied:", statements(migration).length, "statements");
for (const s of statements(metricsSql)) await db.exec(s);
console.log("metrics views created");

// --- verify.sql: rls + policy counts + append-only ---
const v = await db.query(verifySql);
for (const r of v.rows) ok(r.ok && r.append_only, `${r.name}: rls=${r.rls} policies=${r.policies}/${r.want_policies} append_only=${r.append_only}`);

// --- two users via the auth trigger ---
const A = "11111111-1111-1111-1111-111111111111", B = "22222222-2222-2222-2222-222222222222";
await db.exec(`insert into auth.users (id, email) values ('${A}', 'a@test'), ('${B}', 'b@test')`);
const users = await db.query("select count(*)::int as n from public.users");
ok(users.rows[0].n === 2, "auth trigger created public.users rows");

const as = async (uid) => { await db.exec(`reset role`); await db.exec(`select set_config('request.jwt.claim.sub', '${uid}', false)`); await db.exec(`set role authenticated`); };
const EID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
await as(A);
await db.exec(`insert into public.enrollments (id, user_id, plan, started_at, availability) values ('${EID}', '${A}', '{"id":"p"}', '2026-09-14', '{"days":[1,2,3,4,5],"minutes_per_day":45}')`);
await db.exec(`insert into public.completions (id, user_id, enrollment_id, unit_id, date, outcome, minutes, log_text, created_at) values (gen_random_uuid(), '${A}', '${EID}', 'u1', '2026-09-14', 'done', 40, 'secret log', now())`);
await db.exec(`insert into public.events (user_id, name, props, at) values ('${A}', 'unit_done', '{}', now())`);
ok((await db.query("select count(*)::int as n from public.completions")).rows[0].n === 1, "A reads own completion");

// append-only: UPDATE/DELETE denied at the grant level (before policies are even consulted)
let denied = 0;
for (const sql of [`update public.completions set log_text = 'x'`, `delete from public.completions`, `select count(*) from public.events`, `update public.reviews set finished = 'x'`, `select * from public.nudges`]) {
  try { await db.exec(sql); } catch (e) { if (/permission denied/i.test(e.message)) denied++; else console.error("unexpected:", e.message); }
}
ok(denied === 5, "completions/reviews immutable, events write-only, nudges invisible to the API role");

// wrong-user insert rejected by RLS
let rlsInsert = false;
try { await db.exec(`insert into public.completions (id, user_id, enrollment_id, unit_id, date, outcome, created_at) values (gen_random_uuid(), '${B}', '${EID}', 'u2', '2026-09-14', 'done', now())`); }
catch (e) { rlsInsert = /row-level security/i.test(e.message); }
ok(rlsInsert, "A cannot insert a row owned by B");

// negative cross-user read
await as(B);
ok((await db.query("select count(*)::int as n from public.completions")).rows[0].n === 0, "B sees zero of A's completions");
ok((await db.query("select count(*)::int as n from public.enrollments")).rows[0].n === 0, "B sees zero of A's enrollments");
ok((await db.query("select count(*)::int as n from public.users")).rows[0].n === 1, "B sees only their own users row");
let updateOther = 0;
await db.exec(`update public.enrollments set why = 'hacked' where id = '${EID}'`);
await as(A);
updateOther = (await db.query(`select why from public.enrollments where id = '${EID}'`)).rows[0].why;
ok(updateOther === "", "B's update of A's enrollment affected zero rows");

// cascade: deleting the auth user removes everything (B7)
await db.exec(`reset role`);
await db.exec(`delete from auth.users where id = '${A}'`);
const left = await db.query(`select (select count(*) from public.users where id = '${A}') + (select count(*) from public.enrollments where user_id = '${A}') + (select count(*) from public.completions where user_id = '${A}') + (select count(*) from public.events where user_id = '${A}') as n`);
ok(Number(left.rows[0].n) === 0, "deleting the auth user cascades to zero rows across tables");

// metrics views return rows on seeded data (B6)
await db.exec(`insert into auth.users (id, email) values ('${A}', 'a@test')`);
await db.exec(`insert into public.events (user_id, name, props, at) values ('${A}', 'unit_done', '{}', now() - interval '1 day'), ('${A}', 'unit_done', '{}', now() - interval '2 day'), ('${A}', 'unit_done', '{}', now() - interval '3 day'), ('${A}', 'return_started', '{}', now() - interval '5 day'), ('${A}', 'notification_opened', '{}', now() - interval '1 day'), ('${A}', 'unit_started', '{}', now() - interval '1 day' + interval '10 minutes')`);
for (const view of ["metrics_north_star", "metrics_retention", "metrics_lapse_recovery", "metrics_notification_to_start"]) {
  const r = await db.query(`select * from public.${view}`);
  ok(r.rows.length >= 1, `${view}: ${r.rows.length} row(s) — ${JSON.stringify(r.rows[0]).slice(0, 120)}`);
}
console.log(failed ? `SCHEMA TESTS FAILED (${failed})` : "SCHEMA TESTS PASSED");
process.exit(failed ? 1 : 0);
