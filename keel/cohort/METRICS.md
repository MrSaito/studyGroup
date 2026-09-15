# Measuring the MVP criterion (Blueprint §9, CLAUDE.md Phase B exit)

**Criterion, measured 8 weeks after cohort start:** ≥50% of the cohort completing ≥3 units/week **and** ≥50% lapse-recovery rate. If unmet, Phase C is blocked and the core loop gets fixed instead.

Run these via `execute_sql` on project `qwrbevhxtflmwkmueqmw` (service role; the views are revoked from API roles). All events come from the client (`web/src/events.ts`): `unit_done`, `return_started`, `notification_opened`, `unit_started`, …

## Weekly check (any Monday)
```sql
select * from public.metrics_north_star limit 8;             -- learners with ≥3 unit_done that week / active learners
select * from public.metrics_lapse_recovery;                  -- return_started → unit_done within 7 days
select * from public.metrics_notification_to_start;           -- notification_opened → unit_started within 60 min
select * from public.metrics_retention;                       -- D1/D7/D30/D90 by sign-up date
```

## The week-8 verdict
`cohort_start` = the Monday the first invitees started. Replace the date.
```sql
with cohort as (select id as user_id from public.users where created_at::date between date '2026-09-22' and date '2026-09-22' + 7),
weeks as (select generate_series(0, 7) as w),
per as (
  select c.user_id, w.w,
         (select count(*) from public.events e where e.user_id = c.user_id and e.name = 'unit_done'
            and e.at >= date '2026-09-22' + w.w * 7 and e.at < date '2026-09-22' + (w.w + 1) * 7) as units
  from cohort c cross join weeks w)
select (select count(*) from cohort) as cohort_size,
       round(100.0 * count(*) filter (where ok) / nullif(count(*), 0), 1) as pct_users_3plus_most_weeks
from (select user_id, bool_and(units >= 3) filter (where w >= 1) as ok from per group by user_id) x;
-- Reading: pct_users_3plus_most_weeks ≥ 50 is half of the criterion (weeks 2–8; week 1 is onboarding noise).
select * from public.metrics_lapse_recovery;  -- recovery_pct ≥ 50 is the other half.
```
Both ≥ 50 → Phase C entry condition met. Record the two numbers and the date in HANDOVER.md.

## Sanity checks before trusting the numbers
```sql
select name, count(*) from public.events group by 1 order by 2 desc;   -- are events arriving at all?
select count(*) filter (where push) as push_on, count(*) as prefs from public.notification_prefs;
select local_date, kind, count(*) from public.nudges group by 1, 2 order by 1 desc limit 14;  -- is cron sending?
select status, count(*) from cron.job_run_details where jobid = (select jobid from cron.job where jobname = 'keel-nudge') group by 1;
```
Events are only written by signed-in users (sync pushes them). Anonymous learners are invisible to these views — the invite asks everyone to sign in.
