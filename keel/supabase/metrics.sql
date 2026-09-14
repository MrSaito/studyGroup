-- B6 metrics (Blueprint §8). Views over public.events + public.users; read with the service role / dashboard only.
-- North star: learners completing ≥3 units in a week, per week.
create or replace view public.metrics_north_star as
select date_trunc('week', at)::date as week,
       count(distinct user_id) filter (where n >= 3) as learners_3plus,
       count(distinct user_id) as active_learners
from (select user_id, at, count(*) over (partition by user_id, date_trunc('week', at)) as n from public.events where name = 'unit_done') e
group by 1 order by 1 desc;

-- Retention: share of users with any unit_done within D1 / D7 / D30 / D90 of sign-up.
create or replace view public.metrics_retention as
select count(*) as users,
       round(100.0 * count(*) filter (where d1) / nullif(count(*), 0), 1) as d1_pct,
       round(100.0 * count(*) filter (where d7) / nullif(count(*), 0), 1) as d7_pct,
       round(100.0 * count(*) filter (where d30) / nullif(count(*), 0), 1) as d30_pct,
       round(100.0 * count(*) filter (where d90) / nullif(count(*), 0), 1) as d90_pct
from (
  select u.id,
         exists (select 1 from public.events e where e.user_id = u.id and e.name = 'unit_done' and e.at between u.created_at + interval '1 day' and u.created_at + interval '2 day') as d1,
         exists (select 1 from public.events e where e.user_id = u.id and e.name = 'unit_done' and e.at between u.created_at + interval '7 day' and u.created_at + interval '8 day') as d7,
         exists (select 1 from public.events e where e.user_id = u.id and e.name = 'unit_done' and e.at between u.created_at + interval '30 day' and u.created_at + interval '31 day') as d30,
         exists (select 1 from public.events e where e.user_id = u.id and e.name = 'unit_done' and e.at between u.created_at + interval '90 day' and u.created_at + interval '91 day') as d90
  from public.users u) r;

-- Lapse recovery: of Return units started, share followed by a unit_done within 7 days.
create or replace view public.metrics_lapse_recovery as
select count(*) as returns_started,
       count(*) filter (where recovered) as recovered,
       round(100.0 * count(*) filter (where recovered) / nullif(count(*), 0), 1) as recovery_pct
from (
  select r.user_id, r.at,
         exists (select 1 from public.events d where d.user_id = r.user_id and d.name = 'unit_done' and d.at > r.at and d.at <= r.at + interval '7 day') as recovered
  from public.events r where r.name = 'return_started') x;

-- Notification → start: share of notification_opened followed by unit_started within 60 minutes.
create or replace view public.metrics_notification_to_start as
select count(*) as opened,
       count(*) filter (where started) as started_within_1h,
       round(100.0 * count(*) filter (where started) / nullif(count(*), 0), 1) as conversion_pct
from (
  select o.user_id, o.at,
         exists (select 1 from public.events s where s.user_id = o.user_id and s.name = 'unit_started' and s.at > o.at and s.at <= o.at + interval '60 minutes') as started
  from public.events o where o.name = 'notification_opened') x;

revoke all on public.metrics_north_star, public.metrics_retention, public.metrics_lapse_recovery, public.metrics_notification_to_start from anon, authenticated;
