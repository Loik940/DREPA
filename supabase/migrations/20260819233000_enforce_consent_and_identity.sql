-- Implique le consentement et l'identité dans les écritures serveur, indépendamment des guards mobiles.

create function public.has_current_user_consents()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_consents consents
    join public.current_legal_versions versions on versions.singleton = true
    where consents.user_id = auth.uid() and consents.revoked_at is null
      and consents.terms_version = versions.terms_version
      and consents.privacy_version = versions.privacy_version
      and consents.community_guidelines_version = versions.community_guidelines_version
  );
$$;

revoke all on function public.has_current_user_consents() from public, anon;
grant execute on function public.has_current_user_consents() to authenticated;

create function public.require_current_consent_for_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;
  if coalesce(public.is_admin(), false) then return new; end if;
  if not public.has_current_user_consents() then
    raise exception 'Un consentement courant est requis pour cette écriture.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger aa_health_logs_require_consent before insert or update on public.health_logs
for each row execute function public.require_current_consent_for_write();
create trigger aa_medications_require_consent before insert or update on public.medications
for each row execute function public.require_current_consent_for_write();
create trigger aa_medication_reminders_require_consent before insert or update on public.medication_reminders
for each row execute function public.require_current_consent_for_write();
create trigger aa_medication_intakes_require_consent before insert or update on public.medication_intakes
for each row execute function public.require_current_consent_for_write();
create trigger aa_community_posts_require_consent before insert or update on public.community_posts
for each row execute function public.require_current_consent_for_write();
create trigger aa_community_comments_require_consent before insert or update on public.community_comments
for each row execute function public.require_current_consent_for_write();
create trigger aa_community_reactions_require_consent before insert on public.community_post_reactions
for each row execute function public.require_current_consent_for_write();
create trigger aa_community_reports_require_consent before insert on public.community_reports
for each row execute function public.require_current_consent_for_write();

revoke all on function public.require_current_consent_for_write() from public, anon, authenticated;

-- Refuse plutôt que réattribuer une écriture commencée sous une autre session.
create function public.assert_submitted_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare submitted_owner uuid;
begin
  submitted_owner := (to_jsonb(new) ->> tg_argv[0])::uuid;
  if submitted_owner is distinct from auth.uid() then
    raise exception 'Cette écriture appartient à une autre session.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger community_posts_00_assert_owner before insert on public.community_posts
for each row execute function public.assert_submitted_owner('user_id');
create trigger community_comments_00_assert_owner before insert on public.community_comments
for each row execute function public.assert_submitted_owner('user_id');
create trigger community_reports_00_assert_owner before insert on public.community_reports
for each row execute function public.assert_submitted_owner('reporter_id');

revoke all on function public.assert_submitted_owner() from public, anon, authenticated;

-- Un contenu signalé reste stable jusqu'à la décision humaine; la suppression propriétaire reste permise.
create function public.freeze_pending_reported_content()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.deleted_at is not null then return new; end if;
  if tg_table_name = 'community_posts' and new.content is distinct from old.content
    and exists (select 1 from public.community_reports r where r.post_id = old.id and r.status = 'pending') then
    raise exception 'Cette publication attend une décision de modération.' using errcode = '55000';
  end if;
  if tg_table_name = 'community_comments' and new.content is distinct from old.content
    and exists (select 1 from public.community_reports r where r.comment_id = old.id and r.status = 'pending') then
    raise exception 'Ce commentaire attend une décision de modération.' using errcode = '55000';
  end if;
  return new;
end;
$$;

create trigger community_posts_05_freeze_pending before update on public.community_posts
for each row execute function public.freeze_pending_reported_content();
create trigger community_comments_05_freeze_pending before update on public.community_comments
for each row execute function public.freeze_pending_reported_content();

revoke all on function public.freeze_pending_reported_content() from public, anon, authenticated;

drop index if exists public.community_reports_reporter_post_unique_idx;
drop index if exists public.community_reports_reporter_comment_unique_idx;
create unique index community_reports_reporter_post_pending_unique_idx
  on public.community_reports (reporter_id, post_id)
  where post_id is not null and status = 'pending';
create unique index community_reports_reporter_comment_pending_unique_idx
  on public.community_reports (reporter_id, comment_id)
  where comment_id is not null and status = 'pending';

-- Une restauration est valide uniquement si le dernier changement de visibilité est le masquage du même rapport.
create or replace function public.can_restore_community_report(target_report_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare selected_report public.community_reports%rowtype; latest_report_id uuid; latest_action text;
begin
  if not coalesce(public.is_admin(), false) then raise exception 'Accès administrateur requis.' using errcode = '42501'; end if;
  select * into selected_report from public.community_reports where id = target_report_id;
  if not found then return false; end if;
  select actions.report_id, actions.action into latest_report_id, latest_action
  from public.community_moderation_actions actions
  where actions.target_id = coalesce(selected_report.post_id, selected_report.comment_id)
    and actions.target_type = case when selected_report.post_id is not null then 'post' else 'comment' end
    and actions.action in ('hide_post', 'hide_comment', 'restore_post', 'restore_comment')
  order by actions.created_at desc, actions.id desc limit 1;
  if latest_report_id is distinct from target_report_id or latest_action not in ('hide_post', 'hide_comment') then
    return false;
  end if;
  if selected_report.post_id is not null then
    return exists (select 1 from public.community_posts p where p.id = selected_report.post_id
      and p.user_id is not null and p.is_hidden and p.deleted_at is null);
  end if;
  return exists (select 1 from public.community_comments c
    join public.community_posts p on p.id = c.post_id
    where c.id = selected_report.comment_id and c.user_id is not null
      and c.is_hidden and c.deleted_at is null and not p.is_hidden and p.deleted_at is null);
end;
$$;
