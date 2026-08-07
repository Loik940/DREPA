-- Reminder schedules belong to the same user as their prescribed treatment entry.
create table public.medication_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null,
  reminder_time time not null,
  is_enabled boolean not null default true,
  notification_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medication_reminders_owner_medication_fk
    foreign key (medication_id, user_id)
    references public.medications(id, user_id)
    on delete cascade,
  constraint medication_reminders_notification_id_length
    check (notification_id is null or char_length(notification_id) <= 200),
  constraint medication_reminders_unique_time unique (medication_id, reminder_time)
);

create index medication_reminders_user_enabled_idx
on public.medication_reminders(user_id, is_enabled, reminder_time);

create trigger medication_reminders_set_updated_at
before update on public.medication_reminders
for each row execute function public.set_updated_at();

alter table public.medication_reminders enable row level security;

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

revoke all privileges on table public.medication_reminders from anon;
revoke all privileges on table public.medication_reminders from public;
grant select, insert, update, delete on table public.medication_reminders to authenticated;
