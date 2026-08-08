-- Health journal entries are private, declarative data owned by the authenticated user.
-- Cette table contient les entrées privées du journal de santé.
create table public.health_logs (
  id uuid primary key default gen_random_uuid(),
  -- Cette contrainte relie l’entrée à son propriétaire authentifié.
  user_id uuid not null references auth.users(id) on delete cascade,
  pain_level integer,
  pain_location text,
  temperature numeric(4, 1),
  hydration_level text,
  fatigue_level integer,
  symptoms text[],
  possible_triggers text[],
  medication_taken boolean,
  notes text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_logs_pain_level_range
    check (pain_level is null or pain_level between 0 and 10),
  constraint health_logs_fatigue_level_range
    check (fatigue_level is null or fatigue_level between 0 and 10),
  constraint health_logs_hydration_level_values
    check (hydration_level is null or hydration_level in ('low', 'medium', 'good')),
  constraint health_logs_pain_location_length
    check (pain_location is null or char_length(pain_location) <= 120),
  constraint health_logs_notes_length
    check (notes is null or char_length(notes) <= 2000)
);

-- Cet index accélère la recherche chronologique des entrées d’un utilisateur.
create index health_logs_user_recorded_at_idx
on public.health_logs(user_id, recorded_at desc);

-- Ce trigger actualise la date après chaque modification d’une entrée.
create trigger health_logs_set_updated_at
before update on public.health_logs
for each row execute function public.set_updated_at();

-- Cette fonction prépare le contrôle utilisé par le trigger de date future.
create or replace function public.reject_future_health_log()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.recorded_at > now() then
    raise exception 'Health log recorded_at cannot be in the future';
  end if;

  return new;
end;
$$;

-- Ce trigger refuse une entrée enregistrée dans le futur.
create trigger health_logs_reject_future_recorded_at
before insert or update on public.health_logs
for each row execute function public.reject_future_health_log();

-- La RLS protège chaque entrée du journal de santé.
alter table public.health_logs enable row level security;

-- Ces policies limitent chaque opération au propriétaire de l’entrée.
create policy "health_logs_select_own"
on public.health_logs
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "health_logs_insert_own"
on public.health_logs
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "health_logs_update_own"
on public.health_logs
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "health_logs_delete_own"
on public.health_logs
for delete to authenticated
using ((select auth.uid()) = user_id);

-- Ces droits retirent les accès publics et autorisent les utilisateurs authentifiés.
grant usage on schema public to authenticated;
revoke all privileges on table public.health_logs from anon;
revoke all privileges on table public.health_logs from public;
grant select, insert, update, delete on table public.health_logs to authenticated;
