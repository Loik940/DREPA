-- Prescribed treatments entered by users; DRÉPA never recommends a medication or dosage.
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text not null,
  frequency text not null,
  start_date date not null default current_date,
  end_date date,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medications_name_length check (char_length(name) between 1 and 120),
  constraint medications_dosage_length check (char_length(dosage) between 1 and 120),
  constraint medications_frequency_length check (char_length(frequency) between 1 and 80),
  constraint medications_notes_length check (notes is null or char_length(notes) <= 1000),
  constraint medications_date_order check (end_date is null or end_date >= start_date),
  constraint medications_owner_pair unique (id, user_id)
);

create index medications_user_active_idx
on public.medications(user_id, is_active, created_at desc);

create trigger medications_set_updated_at
before update on public.medications
for each row execute function public.set_updated_at();

alter table public.medications enable row level security;

create policy "medications_select_own"
on public.medications for select to authenticated
using ((select auth.uid()) = user_id);

create policy "medications_insert_own"
on public.medications for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "medications_update_own"
on public.medications for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "medications_delete_own"
on public.medications for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all privileges on table public.medications from anon;
revoke all privileges on table public.medications from public;
grant select, insert, update, delete on table public.medications to authenticated;
