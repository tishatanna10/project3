-- Store one answer for each assessment question per user. The composite key
-- makes the assessment safely repeatable with an upsert from the application.
create table if not exists public.assessment_responses (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  assessment_completed boolean not null default false,
  skill_profile jsonb not null default '{}'::jsonb,
  interest_profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

alter table public.assessment_responses enable row level security;

create policy "Users can read their own assessment responses"
  on public.assessment_responses for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own assessment responses"
  on public.assessment_responses for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own assessment responses"
  on public.assessment_responses for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- If profiles already has an owner-update policy, this can be omitted.
create policy "Users can create their own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
