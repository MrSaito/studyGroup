-- Keel core schema (Phase B2). Plain PostgreSQL 16+; Supabase supplies auth.uid().
-- Design (CLAUDE.md §5): the server never computes a schedule. It stores
-- enrollment (LWW on updated_at), completions/events (append-only), reviews,
-- push subscriptions, notification prefs. RLS on every table, user_id = auth.uid().

create extension if not exists pgcrypto;

-- Users mirror auth.users: created by trigger on sign-up, carries tz/locale for nudges.
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  tz          text not null default 'Asia/Karachi',
  locale      text not null default 'en',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.enrollments (
  id            uuid primary key,
  user_id       uuid not null references public.users(id) on delete cascade,
  plan          jsonb not null,
  started_at    date not null,
  availability  jsonb not null,
  intention     jsonb not null default '{}'::jsonb,
  why           text not null default '',
  status        text not null default 'active' check (status in ('active', 'archived', 'complete')),
  updated_at    timestamptz not null default now()   -- LWW key
);
create index if not exists enrollments_user_idx on public.enrollments (user_id, updated_at desc);

create table if not exists public.completions (
  id             uuid primary key,                    -- client uuid: idempotent sync
  user_id        uuid not null references public.users(id) on delete cascade,
  enrollment_id  uuid not null references public.enrollments(id) on delete cascade,
  unit_id        text not null,
  date           date not null,
  outcome        text not null check (outcome in ('done', 'swapped_review', 'pushed', 'skipped')),
  minutes        int check (minutes is null or minutes >= 0),
  log_text       text,
  created_at     timestamptz not null
);
create index if not exists completions_user_created_idx on public.completions (user_id, created_at);

create table if not exists public.reviews (
  id             uuid primary key,
  user_id        uuid not null references public.users(id) on delete cascade,
  enrollment_id  uuid not null references public.enrollments(id) on delete cascade,
  week_start     date not null,
  finished       text not null default '',
  stuck          text not null default '',
  next           text not null default '',
  created_at     timestamptz not null
);
create index if not exists reviews_user_idx on public.reviews (user_id, created_at);

create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  ua          text,
  created_at  timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

create table if not exists public.notification_prefs (
  user_id      uuid primary key references public.users(id) on delete cascade,
  push         boolean not null default false,
  quiet_start  time not null default '22:00',
  quiet_end    time not null default '07:00',
  adaptive     boolean not null default false,
  send_at      time not null default '20:00',       -- local time of the intention
  updated_at   timestamptz not null default now()
);

create table if not exists public.events (
  id       bigserial primary key,
  user_id  uuid not null references public.users(id) on delete cascade,
  name     text not null,
  props    jsonb not null default '{}'::jsonb,
  at       timestamptz not null default now()
);
create index if not exists events_user_at_idx on public.events (user_id, at);
create index if not exists events_name_at_idx on public.events (name, at);

-- Nudge log: the fan-out function records what it sent so "never more than two per day" is enforceable.
create table if not exists public.nudges (
  id         bigserial primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  local_date date not null,
  kind       text not null check (kind in ('first', 'second')),
  sent_at    timestamptz not null default now()
);
create index if not exists nudges_user_date_idx on public.nudges (user_id, local_date);

-- ---------- users row on sign-up ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS: every table, user_id = auth.uid() ----------
alter table public.users               enable row level security;
alter table public.enrollments         enable row level security;
alter table public.completions         enable row level security;
alter table public.reviews             enable row level security;
alter table public.push_subscriptions  enable row level security;
alter table public.notification_prefs  enable row level security;
alter table public.events              enable row level security;
alter table public.nudges              enable row level security;

-- users: read + update own row (tz/locale); insert comes from the trigger.
create policy users_select on public.users for select using (id = auth.uid());
create policy users_update on public.users for update using (id = auth.uid()) with check (id = auth.uid());
create policy users_insert on public.users for insert with check (id = auth.uid());

-- enrollments: full CRUD on own rows (LWW handled client-side by updated_at).
create policy enrollments_select on public.enrollments for select using (user_id = auth.uid());
create policy enrollments_insert on public.enrollments for insert with check (user_id = auth.uid());
create policy enrollments_update on public.enrollments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy enrollments_delete on public.enrollments for delete using (user_id = auth.uid());

-- completions: append-only — select + insert only. No update/delete policy exists.
create policy completions_select on public.completions for select using (user_id = auth.uid());
create policy completions_insert on public.completions for insert with check (user_id = auth.uid());

-- reviews: append-only likewise.
create policy reviews_select on public.reviews for select using (user_id = auth.uid());
create policy reviews_insert on public.reviews for insert with check (user_id = auth.uid());

-- push_subscriptions: own rows, deletable (unsubscribe).
create policy push_select on public.push_subscriptions for select using (user_id = auth.uid());
create policy push_insert on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy push_update on public.push_subscriptions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy push_delete on public.push_subscriptions for delete using (user_id = auth.uid());

-- notification_prefs: own row, upsertable.
create policy prefs_select on public.notification_prefs for select using (user_id = auth.uid());
create policy prefs_insert on public.notification_prefs for insert with check (user_id = auth.uid());
create policy prefs_update on public.notification_prefs for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- events: append-only — insert only; the client never reads events back.
create policy events_insert on public.events for insert with check (user_id = auth.uid());

-- nudges: written by the service role only (no policy for users at all).

-- Belt and braces on top of policies: the API role physically cannot UPDATE/DELETE append-only tables.
revoke update, delete on public.completions from authenticated, anon;
revoke update, delete on public.reviews from authenticated, anon;
revoke update, delete, select on public.events from authenticated, anon;
revoke all on public.nudges from authenticated, anon;
