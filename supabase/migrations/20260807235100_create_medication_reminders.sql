-- Reminder schedules belong to the same user as their prescribed treatment entry.
-- Cette table contient les horaires de rappel des traitements.
create table public.medication_reminders (
  id uuid primary key default gen_random_uuid(),
  -- Cette contrainte relie le rappel à son propriétaire authentifié.
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null,
  reminder_time time not null,
  is_enabled boolean not null default true,
  notification_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Cette contrainte garantit que le rappel et le traitement ont le même propriétaire.
  constraint medication_reminders_owner_medication_fk
    foreign key (medication_id, user_id)
    references public.medications(id, user_id)
    on delete cascade,
  constraint medication_reminders_notification_id_length
    check (notification_id is null or char_length(notification_id) <= 200),
  constraint medication_reminders_unique_time unique (medication_id, reminder_time)
);

-- Cet index accélère la recherche des rappels actifs d’un utilisateur.
create index medication_reminders_user_enabled_idx
on public.medication_reminders(user_id, is_enabled, reminder_time);

-- Ce trigger actualise la date après chaque modification d’un rappel.
create trigger medication_reminders_set_updated_at
before update on public.medication_reminders
for each row execute function public.set_updated_at();

-- La RLS protège chaque rappel de traitement.
alter table public.medication_reminders enable row level security;

-- Ces policies limitent chaque opération au propriétaire du rappel.
create policy "medication_reminders_select_own"
on public.medication_reminders for select to authenticated
using ((select auth.uid()) = user_id);

create policy "medication_reminders_insert_own"
on public.medication_reminders for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.medications
    where medications.id = medication_reminders.medication_id
      and medications.user_id = (select auth.uid())
  )
);

create policy "medication_reminders_update_own"
on public.medication_reminders for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.medications
    where medications.id = medication_reminders.medication_id
      and medications.user_id = (select auth.uid())
  )
);

create policy "medication_reminders_delete_own"
on public.medication_reminders for delete to authenticated
using ((select auth.uid()) = user_id);

-- Ces droits retirent les accès publics et autorisent les utilisateurs authentifiés.
revoke all privileges on table public.medication_reminders from anon;
revoke all privileges on table public.medication_reminders from public;
grant select, insert, update, delete on table public.medication_reminders to authenticated;
