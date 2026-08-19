-- Réserve les changements de visibilité au contexte transactionnel posé par la RPC de modération.

create or replace function public.protect_community_post_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
  moderation_context text := nullif(pg_catalog.current_setting('app.moderation_report_id', true), '');
begin
  if pg_catalog.pg_trigger_depth() > 1 and old.user_id is not null and new.user_id is null then
    new.id := old.id; new.user_id := null; new.author_alias := 'Compte supprimé';
    new.category := old.category; new.content := 'Publication supprimée avec le compte.';
    new.support_count := old.support_count; new.comments_count := old.comments_count;
    new.is_hidden := old.is_hidden; new.deleted_at := old.deleted_at;
    new.created_at := old.created_at; new.updated_at := pg_catalog.statement_timestamp(); return new;
  end if;
  new.id := old.id; new.user_id := old.user_id; new.author_alias := old.author_alias; new.created_at := old.created_at;
  if old.user_id is null or old.deleted_at is not null then
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden; new.content := old.content; new.category := old.category;
  elsif new.deleted_at is not null and old.user_id = current_user_id then
    new.deleted_at := pg_catalog.now(); new.is_hidden := true; new.content := old.content; new.category := old.category;
  elsif current_user_is_admin and moderation_context is not null then
    new.deleted_at := old.deleted_at; new.content := old.content; new.category := old.category;
  else
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden; new.content := pg_catalog.btrim(new.content);
  end if;
  if pg_catalog.pg_trigger_depth() = 1 then
    new.support_count := old.support_count; new.comments_count := old.comments_count;
  end if;
  new.updated_at := pg_catalog.now(); return new;
end;
$$;

create or replace function public.protect_community_comment_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
  moderation_context text := nullif(pg_catalog.current_setting('app.moderation_report_id', true), '');
begin
  if pg_catalog.pg_trigger_depth() > 1 and old.user_id is not null and new.user_id is null then
    new.id := old.id; new.post_id := old.post_id; new.user_id := null;
    new.author_alias := 'Compte supprimé'; new.content := 'Commentaire supprimé avec le compte.';
    new.is_hidden := old.is_hidden; new.deleted_at := old.deleted_at;
    new.created_at := old.created_at; new.updated_at := pg_catalog.statement_timestamp(); return new;
  end if;
  new.id := old.id; new.post_id := old.post_id; new.user_id := old.user_id;
  new.author_alias := old.author_alias; new.created_at := old.created_at;
  if old.user_id is null or old.deleted_at is not null then
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden; new.content := old.content;
  elsif new.deleted_at is not null and old.user_id = current_user_id then
    new.deleted_at := pg_catalog.now(); new.is_hidden := true; new.content := old.content;
  elsif current_user_is_admin and moderation_context is not null then
    new.deleted_at := old.deleted_at; new.content := old.content;
  else
    new.deleted_at := old.deleted_at; new.is_hidden := old.is_hidden; new.content := pg_catalog.btrim(new.content);
  end if;
  new.updated_at := pg_catalog.statement_timestamp(); return new;
end;
$$;

-- Refuse toute décision hide/restore sur un tombstone avant l'appel de la RPC interne.
create or replace function public.moderate_community_report(target_report_id uuid, decision text, note text default null)
returns text language plpgsql volatile security definer set search_path = ''
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
  if not coalesce(public.is_admin(), false) then raise exception 'Accès réservé aux administrateurs.' using errcode = '42501'; end if;
  select reports.* into selected_report from public.community_reports reports
  where reports.id = target_report_id for update;
  if not found then raise exception 'Signalement introuvable.' using errcode = 'P0002'; end if;
  if selected_report.post_id is not null then
    select posts.user_id, posts.is_hidden, posts.deleted_at into target_owner, target_hidden, target_deleted
    from public.community_posts posts where posts.id = selected_report.post_id for update;
  else
    select comments.user_id, comments.is_hidden, comments.deleted_at, posts.is_hidden, posts.deleted_at
      into target_owner, target_hidden, target_deleted, parent_hidden, parent_deleted
    from public.community_comments comments join public.community_posts posts on posts.id = comments.post_id
    where comments.id = selected_report.comment_id for update of comments, posts;
  end if;
  if normalized_decision in ('hide', 'restore') and target_owner is null then
    raise exception 'Un contenu tombstone ne peut pas être modéré.' using errcode = '55000';
  end if;
  if normalized_decision = 'restore' and (
    not target_hidden or target_deleted is not null
    or (selected_report.comment_id is not null and (parent_hidden or parent_deleted is not null))
  ) then
    raise exception 'La cible ne peut pas être restaurée.' using errcode = '55000';
  end if;
  return public.moderate_community_report_internal(target_report_id, decision, note);
end;
$$;

alter table public.medication_intakes add constraint medication_intakes_snooze_id_matches_status
check (status = 'snoozed' or snooze_notification_id is null) not valid;
alter table public.medication_intakes validate constraint medication_intakes_snooze_id_matches_status;
