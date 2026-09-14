-- B5 plumbing. Applied AFTER 0001 on the live project (needs Supabase-only pieces: vault, pg_cron, pg_net).
-- Secrets are created by hand at deploy time — never in a migration, never in the repo:
--   select vault.create_secret('<generated>', 'vapid_private_key');
--   select vault.create_secret('<generated>', 'vapid_public_key');
--   select vault.create_secret('<random 32 bytes hex>', 'nudge_cron_secret');
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Service-role-only accessor for Vault secrets (the vault schema is not exposed over PostgREST).
create or replace function public.get_secret(name text) returns text
language sql security definer set search_path = public, vault as $$
  select decrypted_secret from vault.decrypted_secrets where vault.decrypted_secrets.name = get_secret.name limit 1
$$;
revoke all on function public.get_secret(text) from public, anon, authenticated;
grant execute on function public.get_secret(text) to service_role;

-- Every 15 minutes: call the nudge function with the shared secret from Vault. __PROJECT_REF__ is substituted at apply time.
select cron.unschedule('keel-nudge') where exists (select 1 from cron.job where jobname = 'keel-nudge');
select cron.schedule('keel-nudge', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://__PROJECT_REF__.supabase.co/functions/v1/nudge',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-nudge-secret', public.get_secret('nudge_cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000)
$$);
