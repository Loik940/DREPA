-- Prescribed treatments entered by users; DRÉPA never recommends a medication or dosage.
-- Cette table contient les traitements déclarés par les utilisateurs.
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  -- Cette contrainte relie le traitement à son propriétaire authentifié.
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
  -- Cette contrainte permet de vérifier ensemble le traitement et son propriétaire.
  constraint medications_owner_pair unique (id, user_id)
);

-- Cet index accélère la recherche des traitements actifs d’un utilisateur.
create index medications_user_active_idx
on public.medications(user_id, is_active, created_at desc);

-- Ce trigger actualise la date après chaque modification d’un traitement.
create trigger medications_set_updated_at
before update on public.medications
for each row execute function public.set_updated_at();

-- La RLS protège chaque traitement déclaré.
alter table public.medications enable row level security;

-- Ces policies limitent chaque opération au propriétaire du traitement.
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

-- Ces droits retirent les accès publics et autorisent les utilisateurs authentifiés.
revoke all privileges on table public.medications from anon;
revoke all privileges on table public.medications from public;
grant select, insert, update, delete on table public.medications to authenticated;
