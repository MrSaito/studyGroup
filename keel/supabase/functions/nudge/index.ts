// Edge Function `nudge` (B5). Invoked every 15 minutes by pg_cron (see migrations/0002_cron.sql).
// Auth: a shared secret header from Vault (verify_jwt=false because pg_net has no user JWT).
// For each user with push on: compute local time, decide with schedule.ts, send via Web Push, log to nudges.
// Never computes anything the client could disagree with beyond "is the day spent" and "which unit is next":
// both are derived from the same engine code the client runs (files copied from ../../engine/src at deploy).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import webpush from "npm:web-push@3.6.7";
import { decideNudge, localClock, hm } from "./schedule.ts";
import { project, daySpent } from "./engine/schedule.ts";
import { lapse } from "./engine/consistency.ts";
import { weekday } from "./engine/dates.ts";
import type { Enrollment, Plan, Weekday } from "./engine/types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

async function rest(path: string, init: RequestInit = {}): Promise<unknown> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...init, headers: { ...H, ...(init.headers ?? {}) } });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
async function secret(name: string): Promise<string> {
  const rows = (await rest(`/rpc/get_secret`, { method: "POST", body: JSON.stringify({ name }) })) as string;
  return String(rows);
}

Deno.serve(async (req: Request) => {
  const expected = await secret("nudge_cron_secret");
  if (req.headers.get("x-nudge-secret") !== expected) return new Response("forbidden", { status: 403 });
  const dryRun = new URL(req.url).searchParams.get("dry") === "1";
  const vapidPublic = await secret("vapid_public_key"), vapidPrivate = await secret("vapid_private_key");
  webpush.setVapidDetails("mailto:saito.reman@gmail.com", vapidPublic, vapidPrivate);

  const now = new Date();
  const prefs = (await rest(`/notification_prefs?select=user_id,send_at,quiet_start,quiet_end,users(tz,locale)&push=eq.true`)) as Array<{ user_id: string; send_at: string; quiet_start: string; quiet_end: string; users: { tz: string; locale: string } }>;
  const out: Array<Record<string, unknown>> = [];
  for (const p of prefs) {
    try {
      const { localMinutes, localDate } = localClock(now, p.users?.tz || "Asia/Karachi");
      // Cheap pre-filter: outside both windows nothing can fire; skip the heavy queries.
      const t = hm(String(p.send_at).slice(0, 5));
      if (!(localMinutes >= t && localMinutes < t + 15) && !(localMinutes >= t + 90 && localMinutes < t + 105)) continue;
      const [enr] = (await rest(`/enrollments?select=id,plan,started_at,availability,intention&user_id=eq.${p.user_id}&status=eq.active&order=updated_at.desc&limit=1`)) as Array<{ id: string; plan: Plan; started_at: string; availability: { days: Weekday[]; minutes_per_day: number }; intention: { after: string; place: string } }>;
      if (!enr) continue;
      const comps = (await rest(`/completions?select=unit_id,date,outcome,minutes,log_text&enrollment_id=eq.${enr.id}&order=created_at.asc`)) as Enrollment["completions"];
      const e: Enrollment = { plan: enr.plan, started_at: enr.started_at, availability: enr.availability, completions: comps };
      if (localDate < e.started_at) continue;
      const proj = project(e, localDate);
      const unit = proj.items[0]?.unit;
      const hasUnitToday = !!unit && !unit.is_buffer && e.availability.days.includes(weekday(localDate));
      const sent = (await rest(`/nudges?select=kind&user_id=eq.${p.user_id}&local_date=eq.${localDate}`)) as Array<{ kind: "first" | "second" }>;
      const d = decideNudge({
        localMinutes, localDate, sendAt: String(p.send_at).slice(0, 5), quietStart: String(p.quiet_start).slice(0, 5), quietEnd: String(p.quiet_end).slice(0, 5),
        sentToday: sent.map((s) => s.kind), daySpent: daySpent(e, localDate), hasUnitToday, lapseTier: lapse(e, localDate).tier,
        intention: enr.intention ?? { after: "", place: "" }, position: proj.position, unitTitle: unit?.title ?? "", unitMinutes: unit?.est_minutes ?? 0, locale: p.users?.locale,
      });
      if (!d.send) continue;
      const subs = (await rest(`/push_subscriptions?select=id,endpoint,p256dh,auth&user_id=eq.${p.user_id}`)) as Array<{ id: string; endpoint: string; p256dh: string; auth: string }>;
      let delivered = 0;
      for (const s of subs) {
        if (dryRun) { delivered++; continue; }
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: d.title, body: d.body, tag: `keel-${d.kind}`, url: "./?from=push" }), { TTL: 60 * 60, urgency: "normal" });
          delivered++;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await rest(`/push_subscriptions?id=eq.${s.id}`, { method: "DELETE" }); // gone: drop it
          else out.push({ user: p.user_id, error: String(err).slice(0, 120) });
        }
      }
      if (delivered && !dryRun) await rest(`/nudges`, { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: p.user_id, local_date: localDate, kind: d.kind }) });
      out.push({ user: p.user_id, kind: d.kind, delivered, dryRun });
    } catch (err) { out.push({ user: p.user_id, error: String(err).slice(0, 160) }); }
  }
  return new Response(JSON.stringify({ at: now.toISOString(), considered: prefs.length, results: out }), { headers: { "Content-Type": "application/json" } });
});
