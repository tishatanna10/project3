-- Required for users who were created before the profile trigger existed.
-- It lets the assessment completion flow create their missing profile row.
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can create their own profile'
  ) then
    create policy "Users can create their own profile"
      on public.profiles for insert
      with check ((select auth.uid()) = id);
  end if;
end;
$$;
