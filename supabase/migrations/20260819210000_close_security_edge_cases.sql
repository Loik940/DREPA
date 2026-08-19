-- Ferme les derniers cas limites révélés par les tests croisés des triggers et des reprises réseau.

create function public.community_post_accepts_comments(target_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.community_posts posts
    where posts.id = target_post_id and posts.user_id is not null
      and not posts.is_hidden and posts.deleted_at is null
  );
$$;

revoke all on function public.community_post_accepts_comments(uuid) from public, anon;
grant execute on function public.community_post_accepts_comments(uuid) to authenticated;

drop policy if exists community_comments_insert_own_visible_post on public.community_comments;
create policy community_comments_insert_own_visible_post
on public.community_comments
for insert
to authenticated
with check (
  user_id = (select auth.uid()) and not is_hidden
  and public.community_post_accepts_comments(post_id)
);

create or replace function public.protect_community_post_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
begin
  if pg_catalog.pg_trigger_depth() > 1 and old.user_id is not null and new.user_id is null then
    new.id := old.id; new.user_id := null; new.author_alias := 'Compte supprimé';
    new.category := old.category; new.content := 'Publication supprimée avec le compte.';
    new.support_count := old.support_count; new.comments_count := old.comments_count;
    new.is_hidden := old.is_hidden; new.deleted_at := old.deleted_at;
    new.created_at := old.created_at; new.updated_at := pg_catalog.statement_timestamp();
    return new;
  end if;
  new.id := old.id; new.user_id := old.user_id; new.author_alias := old.author_alias; new.created_at := old.created_at;
  if old.user_id is null then
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden;
    new.content := old.content; new.category := old.category;
  elsif old.deleted_at is not null then
    new.deleted_at := old.deleted_at; new.is_hidden := true;
    new.content := old.content; new.category := old.category;
  elsif new.deleted_at is not null and old.user_id = current_user_id then
    new.deleted_at := pg_catalog.now(); new.is_hidden := true;
    new.content := old.content; new.category := old.category;
  elsif current_user_is_admin then
    new.deleted_at := old.deleted_at;
    if old.user_id is distinct from current_user_id then
      new.content := old.content; new.category := old.category;
    else
      new.content := pg_catalog.btrim(new.content);
    end if;
  else
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden;
    new.content := pg_catalog.btrim(new.content);
  end if;
  if pg_catalog.pg_trigger_depth() = 1 then
    new.support_count := old.support_count; new.comments_count := old.comments_count;
  end if;
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create or replace function public.protect_community_comment_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
begin
  if pg_catalog.pg_trigger_depth() > 1 and old.user_id is not null and new.user_id is null then
    new.id := old.id; new.post_id := old.post_id; new.user_id := null;
    new.author_alias := 'Compte supprimé'; new.content := 'Commentaire supprimé avec le compte.';
    new.is_hidden := old.is_hidden; new.deleted_at := old.deleted_at;
    new.created_at := old.created_at; new.updated_at := pg_catalog.statement_timestamp();
    return new;
  end if;
  new.id := old.id; new.post_id := old.post_id; new.user_id := old.user_id;
  new.author_alias := old.author_alias; new.created_at := old.created_at;
  if old.user_id is null then
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden; new.content := old.content;
  elsif old.deleted_at is not null then
    new.deleted_at := old.deleted_at; new.is_hidden := true; new.content := old.content;
  elsif new.deleted_at is not null and old.user_id = current_user_id then
    new.deleted_at := pg_catalog.now(); new.is_hidden := true; new.content := old.content;
  elsif current_user_is_admin then
    new.deleted_at := old.deleted_at;
    new.content := case when old.user_id = current_user_id then pg_catalog.btrim(new.content) else old.content end;
  else
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden; new.content := pg_catalog.btrim(new.content);
  end if;
  new.updated_at := pg_catalog.statement_timestamp();
  return new;
end;
$$;

-- Remplace le wrapper de restauration afin de verrouiller rapport, cible et parent avant validation.
create or replace function public.moderate_community_report(target_report_id uuid, decision text, note text default null)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_decision text := pg_catalog.lower(pg_catalog.btrim(decision));
  selected_report public.community_reports%rowtype;
  target_owner uuid;
  target_hidden boolean;
  target_deleted timestamptz;
  parent_hidden boolean;
  parent_deleted timestamptz;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Accès réservé aux administrateurs.' using errcode = '42501';
  end if;
  select reports.* into selected_report from public.community_reports reports
  where reports.id = target_report_id for update;
  if not found then raise exception 'Signalement introuvable.' using errcode = 'P0002'; end if;
  if normalized_decision = 'restore' then
    if selected_report.post_id is not null then
      select posts.user_id, posts.is_hidden, posts.deleted_at
        into target_owner, target_hidden, target_deleted
      from public.community_posts posts where posts.id = selected_report.post_id for update;
      if not found or target_owner is null or not target_hidden or target_deleted is not null then
        raise exception 'La cible ne peut pas être restaurée.' using errcode = '55000';
      end if;
    else
      select comments.user_id, comments.is_hidden, comments.deleted_at,
        posts.is_hidden, posts.deleted_at
        into target_owner, target_hidden, target_deleted, parent_hidden, parent_deleted
      from public.community_comments comments
      join public.community_posts posts on posts.id = comments.post_id
      where comments.id = selected_report.comment_id
      for update of comments, posts;
      if not found or target_owner is null or not target_hidden or target_deleted is not null
        or parent_hidden or parent_deleted is not null then
        raise exception 'La cible ne peut pas être restaurée.' using errcode = '55000';
      end if;
    end if;
  end if;
  return public.moderate_community_report_internal(target_report_id, decision, note);
end;
$$;

revoke all on function public.moderate_community_report(uuid, text, text) from public, anon;
grant execute on function public.moderate_community_report(uuid, text, text) to authenticated;

-- Le retrait d'un soutien reste journalisé et limité même si la cible devient indisponible.
create or replace function public.set_community_post_support(target_post_id uuid, desired_state boolean)
returns table (has_supported boolean, support_count integer)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  post_available boolean;
  final_count integer;
  current_state boolean;
begin
  if actor_id is null then raise exception 'Session authentifiée requise.' using errcode = '42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('community-support:' || actor_id::text, 0));
  select posts.user_id is not null and not posts.is_hidden and posts.deleted_at is null
    into post_available from public.community_posts posts where posts.id = target_post_id for update;
  if not found then raise exception 'Publication introuvable.' using errcode = 'P0002'; end if;
  select exists (select 1 from public.community_post_reactions r
    where r.post_id = target_post_id and r.user_id = actor_id) into current_state;
  if current_state = desired_state then
    select posts.support_count into final_count from public.community_posts posts where posts.id = target_post_id;
    return query select current_state, final_count; return;
  end if;
  if (select count(*) from public.community_support_events e where e.user_id = actor_id
      and e.created_at >= pg_catalog.now() - interval '10 minutes') >= 30
    or (select count(*) from public.community_support_events e where e.user_id = actor_id
      and e.created_at >= pg_catalog.now() - interval '24 hours') >= 200 then
    raise exception 'Limite de changements de soutien atteinte.' using errcode = 'P0001';
  end if;
  if desired_state then
    if not post_available then raise exception 'Cette publication ne peut plus recevoir de soutien.' using errcode = '55000'; end if;
    return query select * from public.set_community_post_support_internal(target_post_id, true); return;
  end if;
  delete from public.community_post_reactions r where r.post_id = target_post_id and r.user_id = actor_id;
  insert into public.community_support_events(user_id, post_id, desired_state)
  values (actor_id, target_post_id, false);
  select posts.support_count into final_count from public.community_posts posts where posts.id = target_post_id;
  return query select false, final_count;
end;
$$;

-- Les reprises du même UUID passent avant les quotas et champs propriétaires immuables.
create or replace function public.enforce_authenticated_row_quota()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare actor_id uuid := auth.uid(); current_rows bigint; row_exists boolean;
begin
  if actor_id is null then return new; end if;
  execute pg_catalog.format('select exists(select 1 from %I.%I where id = $1 and %I = $2)',
    tg_table_schema, tg_table_name, tg_argv[0]) into row_exists using new.id, actor_id;
  if row_exists then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('quota:' || tg_table_schema || '.' || tg_table_name || ':' || actor_id::text, 0));
  execute pg_catalog.format('select count(*) from %I.%I where %I = $1',
    tg_table_schema, tg_table_name, tg_argv[0]) into current_rows using actor_id;
  if current_rows >= tg_argv[1]::bigint then
    raise exception 'Quota de stockage atteint pour cette ressource.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create or replace function public.protect_medication_reminder_owner()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  new.user_id := old.user_id;
  new.medication_id := old.medication_id;
  return new;
end;
$$;

create trigger medication_reminders_protect_owner
before update on public.medication_reminders
for each row execute function public.protect_medication_reminder_owner();

update public.medication_intakes set taken_at = null where status <> 'taken' and taken_at is not null;
alter table public.medication_intakes add constraint medication_intakes_taken_at_matches_status
check ((status = 'taken') = (taken_at is not null)) not valid;
alter table public.medication_intakes validate constraint medication_intakes_taken_at_matches_status;

create or replace function public.protect_profile_system_fields()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then new.id := old.id; new.created_at := old.created_at; end if;
  if new.date_of_birth is not null and new.date_of_birth > current_date then
    raise exception 'La date de naissance ne peut pas être future.' using errcode = '22007';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_system_fields
before insert or update on public.profiles
for each row execute function public.protect_profile_system_fields();
