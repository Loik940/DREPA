-- Corrige les régressions détectées après le durcissement serveur sans modifier la migration appliquée.

-- Autorise les tombstones imbriqués et garde la modération fonctionnelle pour le contenu du modérateur.
create or replace function public.protect_community_comment_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
begin
  if pg_catalog.pg_trigger_depth() > 1 and old.user_id is not null and new.user_id is null then
    new.id := old.id;
    new.post_id := old.post_id;
    new.user_id := null;
    new.author_alias := 'Compte supprimé';
    new.content := 'Commentaire supprimé avec le compte.';
    new.is_hidden := old.is_hidden;
    new.deleted_at := old.deleted_at;
    new.created_at := old.created_at;
    new.updated_at := pg_catalog.statement_timestamp();
    return new;
  end if;

  new.id := old.id;
  new.post_id := old.post_id;
  new.user_id := old.user_id;
  new.author_alias := old.author_alias;
  new.created_at := old.created_at;
  if old.user_id is null or old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
    new.is_hidden := true;
    new.content := old.content;
  elsif current_user_is_admin then
    new.deleted_at := old.deleted_at;
    new.content := case when old.user_id = current_user_id then pg_catalog.btrim(new.content) else old.content end;
  elsif new.deleted_at is not null then
    new.deleted_at := pg_catalog.now();
    new.is_hidden := true;
    new.content := old.content;
  else
    new.deleted_at := old.deleted_at;
    new.is_hidden := old.is_hidden;
    new.content := pg_catalog.btrim(new.content);
  end if;
  new.updated_at := pg_catalog.statement_timestamp();
  return new;
end;
$$;

create or replace function public.protect_community_post_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
begin
  if pg_catalog.pg_trigger_depth() > 1 and old.user_id is not null and new.user_id is null then
    new.id := old.id;
    new.user_id := null;
    new.author_alias := 'Compte supprimé';
    new.category := old.category;
    new.content := 'Publication supprimée avec le compte.';
    new.support_count := old.support_count;
    new.comments_count := old.comments_count;
    new.is_hidden := old.is_hidden;
    new.deleted_at := old.deleted_at;
    new.created_at := old.created_at;
    new.updated_at := pg_catalog.statement_timestamp();
    return new;
  end if;

  new.id := old.id;
  new.user_id := old.user_id;
  new.author_alias := old.author_alias;
  new.created_at := old.created_at;
  if old.user_id is null or old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
    new.is_hidden := true;
    new.content := old.content;
    new.category := old.category;
  elsif current_user_is_admin then
    new.deleted_at := old.deleted_at;
    if old.user_id is distinct from current_user_id then
      new.content := old.content;
      new.category := old.category;
    else
      new.content := pg_catalog.btrim(new.content);
    end if;
  elsif new.deleted_at is not null then
    new.deleted_at := pg_catalog.now();
    new.is_hidden := true;
    new.content := old.content;
    new.category := old.category;
  else
    new.deleted_at := old.deleted_at;
    new.is_hidden := old.is_hidden;
    new.content := pg_catalog.btrim(new.content);
  end if;
  if pg_catalog.pg_trigger_depth() = 1 then
    new.support_count := old.support_count;
    new.comments_count := old.comments_count;
  end if;
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

-- Le mobile ne choisit jamais les champs de décision lors de la création d'un signalement.
create or replace function public.enforce_community_report_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'Session authentifiée requise.' using errcode = '42501'; end if;
  new.reporter_id := actor_id;
  new.status := 'pending';
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.resolution_note := null;
  new.created_at := pg_catalog.now();
  new.updated_at := new.created_at;
  if new.details is not null then new.details := pg_catalog.btrim(new.details); end if;
  if exists (select 1 from public.community_posts p where p.id = new.post_id and p.user_id = actor_id)
    or exists (select 1 from public.community_comments c where c.id = new.comment_id and c.user_id = actor_id) then
    raise exception 'Un membre ne peut pas signaler son propre contenu.' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor_id::text, 0));
  if (select count(*) from public.community_reports r where r.reporter_id = actor_id
      and r.created_at >= pg_catalog.now() - interval '1 hour') >= 10 then
    raise exception 'Limite de 10 signalements par heure atteinte' using errcode = 'P0001';
  end if;
  if (select count(*) from public.community_reports r where r.reporter_id = actor_id) >= 2000 then
    raise exception 'Quota de signalements atteint' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Les wrappers sécurisent les deux RPC existantes sans dupliquer leur logique éprouvée.
alter function public.set_community_post_support(uuid, boolean)
  rename to set_community_post_support_internal;
revoke all on function public.set_community_post_support_internal(uuid, boolean) from public, anon, authenticated;

create function public.set_community_post_support(target_post_id uuid, desired_state boolean)
returns table (has_supported boolean, support_count integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  post_available boolean;
  final_count integer;
begin
  if actor_id is null then raise exception 'Session authentifiée requise.' using errcode = '42501'; end if;
  select posts.user_id is not null and not posts.is_hidden and posts.deleted_at is null
    into post_available from public.community_posts posts where posts.id = target_post_id for update;
  if not found then raise exception 'Publication introuvable.' using errcode = 'P0002'; end if;
  if desired_state then
    if not post_available then raise exception 'Cette publication ne peut plus recevoir de soutien.' using errcode = '55000'; end if;
    return query select * from public.set_community_post_support_internal(target_post_id, true);
    return;
  end if;
  delete from public.community_post_reactions reactions
  where reactions.post_id = target_post_id and reactions.user_id = actor_id;
  select posts.support_count into final_count from public.community_posts posts where posts.id = target_post_id;
  return query select false, final_count;
end;
$$;

revoke all on function public.set_community_post_support(uuid, boolean) from public, anon;
grant execute on function public.set_community_post_support(uuid, boolean) to authenticated;

alter function public.moderate_community_report(uuid, text, text)
  rename to moderate_community_report_internal;
revoke all on function public.moderate_community_report_internal(uuid, text, text) from public, anon, authenticated;

create function public.moderate_community_report(
  target_report_id uuid,
  decision text,
  note text default null
)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_decision text := pg_catalog.lower(pg_catalog.btrim(decision));
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Accès réservé aux administrateurs.' using errcode = '42501';
  end if;
  if normalized_decision = 'restore' and not public.can_restore_community_report(target_report_id) then
    raise exception 'La cible ne peut pas être restaurée.' using errcode = '55000';
  end if;
  return public.moderate_community_report_internal(target_report_id, decision, note);
end;
$$;

revoke all on function public.moderate_community_report(uuid, text, text) from public, anon;
grant execute on function public.moderate_community_report(uuid, text, text) to authenticated;

-- Les horaires sont normalisés à la minute et les sous-tables reçoivent des quotas propriétaires.
alter table public.medication_reminders
  add constraint medication_reminders_minute_precision
  check (extract(second from reminder_time) = 0) not valid;
alter table public.medication_reminders validate constraint medication_reminders_minute_precision;

create function public.enforce_medication_reminder_quota()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); user_total bigint; medication_total bigint;
begin
  if actor_id is null then return new; end if;
  if exists (select 1 from public.medication_reminders r where r.user_id = actor_id
    and r.medication_id = new.medication_id and r.reminder_time = new.reminder_time) then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('reminder-quota:' || actor_id::text, 0));
  select count(*) into user_total from public.medication_reminders r where r.user_id = actor_id;
  select count(*) into medication_total from public.medication_reminders r
    where r.user_id = actor_id and r.medication_id = new.medication_id;
  if user_total >= 1000 or medication_total >= 16 then
    raise exception 'Quota de rappels atteint.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger zz_medication_reminders_quota before insert on public.medication_reminders
for each row execute function public.enforce_medication_reminder_quota();

create function public.enforce_medication_intake_quota()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); user_total bigint;
begin
  if actor_id is null then return new; end if;
  if exists (select 1 from public.medication_intakes i where i.user_id = actor_id
    and i.medication_id = new.medication_id and i.scheduled_at = new.scheduled_at) then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('intake-quota:' || actor_id::text, 0));
  select count(*) into user_total from public.medication_intakes i where i.user_id = actor_id;
  if user_total >= 100000 then raise exception 'Quota de prises atteint.' using errcode = 'P0001'; end if;
  return new;
end;
$$;

create trigger zz_medication_intakes_quota before insert on public.medication_intakes
for each row execute function public.enforce_medication_intake_quota();

create function public.enforce_user_consent_quota()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select count(*) from public.user_consents c where c.user_id = new.user_id
      and c.accepted_at >= pg_catalog.now() - interval '24 hours') >= 10
    or (select count(*) from public.user_consents c where c.user_id = new.user_id) >= 500 then
    raise exception 'Quota de consentements atteint.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger zz_user_consents_quota before insert on public.user_consents
for each row execute function public.enforce_user_consent_quota();

revoke all on function public.enforce_medication_reminder_quota() from public, anon, authenticated;
revoke all on function public.enforce_medication_intake_quota() from public, anon, authenticated;
revoke all on function public.enforce_user_consent_quota() from public, anon, authenticated;

-- Les contraintes ajoutées en NOT VALID sont validées après le nettoyage staging.
alter table public.profiles validate constraint profiles_country_length;
alter table public.profiles validate constraint profiles_city_length;
alter table public.profiles validate constraint profiles_drepanocytosis_type_length;
alter table public.profiles validate constraint profiles_blood_group_length;
alter table public.profiles validate constraint profiles_allergies_length;
alter table public.profiles validate constraint profiles_care_center_length;
alter table public.profiles validate constraint profiles_doctor_name_length;
alter table public.profiles validate constraint profiles_doctor_phone_length;
alter table public.profiles validate constraint profiles_date_of_birth_not_future;
alter table public.emergency_contacts validate constraint emergency_contacts_phone_length;
alter table public.emergency_contacts validate constraint emergency_contacts_whatsapp_phone_length;
alter table public.emergency_contacts validate constraint emergency_contacts_relationship_length;
alter table public.health_logs validate constraint health_logs_temperature_range;
alter table public.health_logs validate constraint health_logs_symptoms_cardinality;
alter table public.health_logs validate constraint health_logs_triggers_cardinality;
alter table public.user_consents validate constraint user_consents_revocation_after_acceptance;
