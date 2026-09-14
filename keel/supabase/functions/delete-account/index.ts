// Edge Function `delete-account` (B7). The caller's JWT identifies the user (verify_jwt=true);
// the service role deletes the auth user, and every table cascades from users(id) → zero rows.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: CORS });
  const auth = req.headers.get("Authorization") ?? "";
  const me = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: auth } });
  if (!me.ok) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  const { id } = (await me.json()) as { id: string };
  const del = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, { method: "DELETE", headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } });
  if (!del.ok) return new Response(JSON.stringify({ error: `delete failed: ${del.status}` }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  return new Response(JSON.stringify({ deleted: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
});
