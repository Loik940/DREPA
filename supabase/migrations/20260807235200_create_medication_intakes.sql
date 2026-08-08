-- Intake records are user declarations linked to one of their own treatment entries.
-- Cette table contient les prises de traitement déclarées par les utilisateurs.
create table public.medication_intakes (
  id uuid primary key default gen_random_uuid(),
  -- Cette contrainte relie la prise à son propriétaire authentifié.
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null,
  scheduled_at timestamptz not null,
  taken_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Cette contrainte garantit que la prise et le traitement ont le même propriétaire.
  constraint medication_intakes_owner_medication_fk
    foreign key (medication_id, user_id)
    references public.medications(id, user_id)
    on delete cascade,
  constraint medication_intakes_status_values
    check (status in ('pending', 'taken', 'skipped', 'snoozed')),
  constraint medication_intakes_taken_at_required
    check ((status = 'taken' and taken_at is not null) or status <> 'taken'),
  constraint medication_intakes_unique_schedule unique (medication_id, scheduled_at)
);

-- Cet index accélère la recherche chronologique des prises d’un utilisateur.
create index medication_intakes_user_schedule_idx
on public.medication_intakes(user_id, scheduled_at desc);

-- Ce trigger actualise la date après chaque modification d’une prise.
create trigger medication_intakes_set_updated_at
before update on public.medication_intakes
for each row execute function public.set_updated_at();

-- La RLS protège chaque prise de traitement.
alter table public.medication_intakes enable row level security;

-- Ces policies limitent chaque opération au propriétaire de la prise.
create policy "medication_intakes_select_own"
on public.medication_intakes for select to authenticated
using ((select auth.uid()) = user_id);

create policy "medication_intakes_insert_own"
on public.medication_intakes for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.medications
    where medications.id = medication_intakes.medication_id
      and medications.user_id = (select auth.uid())
  )
);

create policy "medication_intakes_update_own"
on public.medication_intakes for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.medications
    where medications.id = medication_intakes.medication_id
      and medications.user_id = (select auth.uid())
  )
);

create policy "medication_intakes_delete_own"
on public.medication_intakes for delete to authenticated
using ((select auth.uid()) = user_id);

-- Ces droits retirent les accès publics et autorisent les utilisateurs authentifiés.
revoke all privileges on table public.medication_intakes from anon;
revoke all privileges on table public.medication_intakes from public;
grant select, insert, update, delete on table public.medication_intakes to authenticated;
