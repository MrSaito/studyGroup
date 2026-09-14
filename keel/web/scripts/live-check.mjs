// Live check against the real Supabase project (no browser: the sandbox proxy blocks Chromium, not Node).
// Needs: two test users (created by SQL), env KEEL_URL/KEEL_ANON (defaults from config), KEEL_NUDGE_SECRET for the dry run.
// Asserts the same boundary the pglite test proved, now on the wire: RLS, append-only, cross-user isolation, delete-account.
const URL_ = process.env.KEEL_URL ?? "https://qwrbevhxtflmwkmueqmw.supabase.co";
const ANON = process.env.KEEL_ANON ?? "sb_publishable_L4QCokZCFT8dnCG1_cUDww_VXGaHxDV";
const PW = "keel-live-check-2026!";
let failed = 0;
const ok = (c, m) => { if (c) console.log("  ok   " + m); else { failed++; console.error("  FAIL " + m); } };
async function signIn(email) {
  const r = await fetch(`${URL_}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ email, password: PW }) });
  if (!r.ok) throw new Error(`sign-in ${email}: ${r.status} ${await r.text()}`);
  return r.json();
}
const rest = (s, path, init = {}) => fetch(`${URL_}/rest/v1${path}`, { ...init, headers: { apikey: ANON, Authorization: `Bearer ${s.access_token}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });

const A = await signIn("livecheck-a@keel.test"), B = await signIn("livecheck-b@keel.test");
ok(A.user?.id && B.user?.id && A.user.id !== B.user.id, `two sessions (${A.user.id.slice(0, 8)}…, ${B.user.id.slice(0, 8)}…)`);
const EID = crypto.randomUUID();
let r = await rest(A, "/enrollments", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: EID, user_id: A.user.id, plan: { id: "p", units: [] }, started_at: "2026-09-14", availability: { days: [1, 2, 3, 4, 5], minutes_per_day: 45 }, intention: { after: "dinner", place: "desk" }, why: "live", updated_at: new Date().toISOString() }) });
ok(r.status === 201, `A inserts enrollment (${r.status})`);
const CID = crypto.randomUUID();
r = await rest(A, "/completions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: CID, user_id: A.user.id, enrollment_id: EID, unit_id: "u1", date: "2026-09-14", outcome: "done", minutes: 40, log_text: "secret log", created_at: new Date().toISOString() }) });
ok(r.status === 201, `A inserts completion (${r.status})`);
r = await rest(A, `/completions?select=id&enrollment_id=eq.${EID}`); ok((await r.json()).length === 1, "A reads own completion");
r = await rest(A, `/completions?id=eq.${CID}`, { method: "PATCH", body: JSON.stringify({ log_text: "edited" }) }); ok(r.status === 401 || r.status === 403 || r.status === 404, `A cannot UPDATE a completion (${r.status})`);
r = await rest(A, `/completions?id=eq.${CID}`, { method: "DELETE" }); ok(r.status === 401 || r.status === 403 || r.status === 404, `A cannot DELETE a completion (${r.status})`);
r = await rest(A, "/completions", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: crypto.randomUUID(), user_id: B.user.id, enrollment_id: EID, unit_id: "u2", date: "2026-09-14", outcome: "done", created_at: new Date().toISOString() }) });
ok(r.status === 401 || r.status === 403, `A cannot insert a row owned by B (${r.status})`);
r = await rest(B, `/completions?select=id`); ok((await r.json()).length === 0, "B reads zero of A's completions");
r = await rest(B, `/enrollments?select=id`); ok((await r.json()).length === 0, "B reads zero of A's enrollments");
r = await rest(B, `/enrollments?id=eq.${EID}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ why: "hacked" }) });
const patched = r.ok ? await r.json() : [];
ok(patched.length === 0, `B's update of A's enrollment touched 0 rows (${r.status})`);
r = await rest(B, `/users?select=id`); ok((await r.json()).length === 1, "B sees only their own users row");
r = await rest(A, `/events?select=id`); ok(r.status === 401 || r.status === 403, `events are write-only for the API role (${r.status})`);
r = await rest(A, `/events`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: A.user.id, name: "unit_done", props: {}, at: new Date().toISOString() }) }); ok(r.status === 201, `A can insert an event (${r.status})`);
// delete-account as B
r = await fetch(`${URL_}/functions/v1/delete-account`, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${B.access_token}`, "Content-Type": "application/json" }, body: "{}" });
ok(r.status === 200, `delete-account for B (${r.status} ${(await r.text()).slice(0, 80)})`);
r = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${B.access_token}` } }); ok(!r.ok, `B's token is dead after deletion (${r.status})`);
// nudge dry run
if (process.env.KEEL_NUDGE_SECRET) {
  r = await fetch(`${URL_}/functions/v1/nudge?dry=1`, { method: "POST", headers: { "x-nudge-secret": process.env.KEEL_NUDGE_SECRET, "Content-Type": "application/json" }, body: "{}" });
  const j = r.ok ? await r.json() : await r.text();
  ok(r.status === 200 && typeof j === "object" && "considered" in j, `nudge dry run (${r.status}) → ${JSON.stringify(j).slice(0, 160)}`);
  r = await fetch(`${URL_}/functions/v1/nudge?dry=1`, { method: "POST", headers: { "x-nudge-secret": "wrong" }, body: "{}" }); ok(r.status === 403, `nudge rejects a wrong secret (${r.status})`);
}
console.log(failed ? `LIVE CHECK FAILED (${failed})` : "LIVE CHECK PASSED");
process.exit(failed ? 1 : 0);
