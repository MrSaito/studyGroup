-- B2 gate. Run via execute_sql. Every row must be ok = true.
with t(name, want_policies) as (values
  ('users', 3), ('enrollments', 4), ('completions', 2), ('reviews', 2),
  ('push_subscriptions', 4), ('notification_prefs', 3), ('events', 1), ('nudges', 0))
select t.name,
       c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = t.name) as policies,
       t.want_policies,
       not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = t.name and p.cmd in ('UPDATE', 'DELETE')
                   and t.name in ('completions', 'reviews', 'events')) as append_only,
       (c.relrowsecurity
        and (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = t.name) = t.want_policies) as ok
from t join pg_class c on c.relname = t.name join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
order by t.name;
