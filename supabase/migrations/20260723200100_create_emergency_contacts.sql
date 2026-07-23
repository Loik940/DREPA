-- Emergency contacts are private and can only be accessed by their owner.
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  whatsapp_phone text,
  relationship text,
  is_primary boolean not null default false,
  consent_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint emergency_contacts_name_length
    check (char_length(name) between 1 and 120),
  constraint emergency_contacts_consent_required
    check (consent_confirmed = true)
);

create index emergency_contacts_user_id_idx
on public.emergency_contacts(user_id);

create unique index one_primary_emergency_contact_per_user
on public.emergency_contacts(user_id)
where is_primary = true;

alter table public.emergency_contacts enable row level security;

create policy "emergency_contacts_select_own"
on public.emergency_contacts
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "emergency_contacts_insert_own"
on public.emergency_contacts
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "emergency_contacts_update_own"
on public.emergency_contacts
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "emergency_contacts_delete_own"
on public.emergency_contacts
for delete to authenticated
using ((select auth.uid()) = user_id);
