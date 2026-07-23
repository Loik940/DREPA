-- Profile data is private and can only be accessed by its owner.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  full_name text,
  date_of_birth date,
  drepanocytosis_type text,
  country text,
  city text,
  blood_group text,
  allergies text,
  care_center text,
  doctor_name text,
  doctor_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_first_name_length check (char_length(first_name) <= 80),
  constraint profiles_full_name_length check (char_length(full_name) <= 160)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
on public.profiles
for delete to authenticated
using ((select auth.uid()) = id);
