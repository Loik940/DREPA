-- Ferme les écritures administrateur directes et déplace les opérations sensibles dans des RPC transactionnelles.
-- Préserve les contributions tierces lors d'une suppression de compte et impose des quotas serveur.

set lock_timeout = '10s';
set statement_timeout = '120s';

-- Les administrateurs doivent utiliser moderate_community_report afin que décision et audit restent atomiques.
drop policy if exists community_posts_update_authenticated on public.community_posts;
create policy community_posts_update_own
on public.community_posts
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists community_comments_update_own_or_admin on public.community_comments;
create policy community_comments_update_own
on public.community_comments
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Retire les auto-soutiens historiques avant d'interdire ce comportement.
delete from public.community_post_reactions as reactions
using public.community_posts as posts
where posts.id = reactions.post_id
  and posts.user_id = reactions.user_id;

drop policy if exists community_post_reactions_select_authenticated on public.community_post_reactions;
drop policy if exists community_post_reactions_insert_own_visible_post on public.community_post_reactions;
drop policy if exists community_post_reactions_delete_own_visible_post on public.community_post_reactions;

create policy community_post_reactions_select_own
on public.community_post_reactions
for select
to authenticated
using (user_id = (select auth.uid()));

revoke all on table public.community_post_reactions from authenticated;
grant select (post_id) on table public.community_post_reactions to authenticated;

create table public.community_support_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  desired_state boolean not null,
  created_at timestamptz not null default now()
);

create index community_support_events_user_created_idx
  on public.community_support_events (user_id, created_at desc);

alter table public.community_support_events enable row level security;
revoke all on table public.community_support_events from public, anon, authenticated;
revoke all on sequence public.community_support_events_id_seq from public, anon, authenticated;

create function public.set_community_post_support(target_post_id uuid, desired_state boolean)
returns table (has_supported boolean, support_count integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  selected_owner_id uuid;
  selected_hidden boolean;
  selected_deleted_at timestamptz;
  current_state boolean;
  final_state boolean;
  final_count integer;
  recent_count bigint;
  daily_count bigint;
begin
  if actor_id is null then
    raise exception 'Session authentifiée requise.' using errcode = '42501';
  end if;
  if target_post_id is null or desired_state is null then
    raise exception 'Paramètres de soutien invalides.' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('community-support:' || actor_id::text, 0)
  );

  select posts.user_id, posts.is_hidden, posts.deleted_at
    into selected_owner_id, selected_hidden, selected_deleted_at
    from public.community_posts as posts
   where posts.id = target_post_id
   for update;

  if not found then
    raise exception 'Publication introuvable.' using errcode = 'P0002';
  end if;
  if selected_owner_id is null or selected_hidden or selected_deleted_at is not null then
    raise exception 'Cette publication ne peut plus recevoir de soutien.' using errcode = '55000';
  end if;
  if selected_owner_id = actor_id then
    raise exception 'Une publication ne peut pas être soutenue par son auteur.' using errcode = '42501';
  end if;

  select exists (
    select 1 from public.community_post_reactions as reactions
    where reactions.post_id = target_post_id and reactions.user_id = actor_id
  ) into current_state;

  if current_state = desired_state then
    select posts.support_count into final_count
    from public.community_posts as posts where posts.id = target_post_id;
    return query select current_state, final_count;
    return;
  end if;

  delete from public.community_support_events as events
  where events.user_id = actor_id
    and events.created_at < pg_catalog.now() - interval '8 days';

  select count(*) into recent_count
  from public.community_support_events as events
  where events.user_id = actor_id
    and events.created_at >= pg_catalog.now() - interval '10 minutes';

  select count(*) into daily_count
  from public.community_support_events as events
  where events.user_id = actor_id
    and events.created_at >= pg_catalog.now() - interval '24 hours';

  if recent_count >= 30 or daily_count >= 200 then
    raise exception 'Limite de changements de soutien atteinte.' using errcode = 'P0001';
  end if;

  if desired_state then
    if (select count(*) from public.community_post_reactions as reactions where reactions.user_id = actor_id) >= 2000 then
      raise exception 'Quota de soutiens actifs atteint.' using errcode = 'P0001';
    end if;
    insert into public.community_post_reactions (post_id, user_id, reaction_type)
    values (target_post_id, actor_id, 'support')
    on conflict (post_id, user_id) do nothing;
  else
    delete from public.community_post_reactions as reactions
    where reactions.post_id = target_post_id and reactions.user_id = actor_id;
  end if;

  select exists (
    select 1 from public.community_post_reactions as reactions
    where reactions.post_id = target_post_id and reactions.user_id = actor_id
  ), posts.support_count
    into final_state, final_count
    from public.community_posts as posts
   where posts.id = target_post_id;

  insert into public.community_support_events (user_id, post_id, desired_state)
  values (actor_id, target_post_id, desired_state);

  return query select final_state, final_count;
end;
$$;

revoke all on function public.set_community_post_support(uuid, boolean) from public, anon;
grant execute on function public.set_community_post_support(uuid, boolean) to authenticated;

-- Les versions acceptables sont définies côté serveur, jamais par l'horloge ou les données du mobile.
create table public.current_legal_versions (
  singleton boolean primary key default true check (singleton),
  terms_version text not null check (char_length(terms_version) between 1 and 64),
  privacy_version text not null check (char_length(privacy_version) between 1 and 64),
  community_guidelines_version text not null check (char_length(community_guidelines_version) between 1 and 64),
  updated_at timestamptz not null default now()
);

insert into public.current_legal_versions (
  singleton, terms_version, privacy_version, community_guidelines_version
) values (true, 'terms-v1', 'privacy-v1', 'community-v1');

alter table public.current_legal_versions enable row level security;
revoke all on table public.current_legal_versions from public, anon, authenticated;

with ranked_active_consents as (
  select consents.id,
    row_number() over (
      partition by consents.user_id
      order by consents.accepted_at desc, consents.id desc
    ) as position
  from public.user_consents as consents
  where consents.revoked_at is null
)
update public.user_consents as consents
set revoked_at = greatest(consents.accepted_at, pg_catalog.statement_timestamp())
from ranked_active_consents as ranked
where ranked.id = consents.id and ranked.position > 1;

create unique index user_consents_one_active_per_user_idx
  on public.user_consents (user_id) where revoked_at is null;

alter table public.user_consents
  add constraint user_consents_revocation_after_acceptance
  check (revoked_at is null or revoked_at >= accepted_at) not valid;

drop policy if exists "user_consents_insert_own" on public.user_consents;
drop policy if exists "user_consents_revoke_own" on public.user_consents;
revoke insert, update on table public.user_consents from authenticated;

create function public.accept_user_consents(
  target_terms_version text,
  target_privacy_version text,
  target_community_guidelines_version text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  expected_versions public.current_legal_versions%rowtype;
  active_consent public.user_consents%rowtype;
  inserted_id uuid;
  accepted_timestamp timestamptz := pg_catalog.statement_timestamp();
begin
  if actor_id is null then
    raise exception 'Session authentifiée requise.' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('user-consent:' || actor_id::text, 0)
  );
  select versions.* into expected_versions
  from public.current_legal_versions as versions where versions.singleton = true;
  if not found then
    raise exception 'Versions légales indisponibles.' using errcode = '55000';
  end if;
  if target_terms_version is distinct from expected_versions.terms_version
    or target_privacy_version is distinct from expected_versions.privacy_version
    or target_community_guidelines_version is distinct from expected_versions.community_guidelines_version then
    raise exception 'Les documents légaux affichés ne sont plus à jour.' using errcode = '55000';
  end if;

  select consents.* into active_consent
  from public.user_consents as consents
  where consents.user_id = actor_id
    and consents.revoked_at is null
    and consents.terms_version = target_terms_version
    and consents.privacy_version = target_privacy_version
    and consents.community_guidelines_version = target_community_guidelines_version
  order by consents.accepted_at desc, consents.id desc
  limit 1;
  if found then return active_consent.id; end if;

  update public.user_consents as consents
  set revoked_at = accepted_timestamp
  where consents.user_id = actor_id and consents.revoked_at is null;

  insert into public.user_consents (
    user_id, terms_version, privacy_version, community_guidelines_version, accepted_at, revoked_at
  ) values (
    actor_id, target_terms_version, target_privacy_version,
    target_community_guidelines_version, accepted_timestamp, null
  ) returning id into inserted_id;
  return inserted_id;
end;
$$;

create function public.revoke_user_consents()
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  affected_rows integer;
begin
  if actor_id is null then
    raise exception 'Session authentifiée requise.' using errcode = '42501';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('user-consent:' || actor_id::text, 0)
  );
  update public.user_consents as consents
  set revoked_at = pg_catalog.statement_timestamp()
  where consents.user_id = actor_id and consents.revoked_at is null;
  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;

revoke all on function public.accept_user_consents(text, text, text) from public, anon;
revoke all on function public.revoke_user_consents() from public, anon;
grant execute on function public.accept_user_consents(text, text, text) to authenticated;
grant execute on function public.revoke_user_consents() to authenticated;

-- Les contributions deviennent des tombstones; les réponses et signalements de tiers restent présents.
alter table public.community_posts drop constraint if exists community_posts_user_id_fkey;
alter table public.community_posts alter column user_id drop not null;
alter table public.community_posts add constraint community_posts_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

alter table public.community_comments drop constraint if exists community_comments_user_id_fkey;
alter table public.community_comments alter column user_id drop not null;
alter table public.community_comments add constraint community_comments_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

create or replace function public.protect_community_post_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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
  if old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
    new.is_hidden := true;
    new.content := old.content;
    new.category := old.category;
  elsif coalesce(public.is_admin(), false) and old.user_id is distinct from auth.uid() then
    new.deleted_at := old.deleted_at;
    new.content := old.content;
    new.category := old.category;
  else
    if new.deleted_at is not null then
      new.deleted_at := pg_catalog.now();
      new.is_hidden := true;
      new.content := old.content;
      new.category := old.category;
    else
      new.deleted_at := old.deleted_at;
      new.is_hidden := old.is_hidden;
      new.content := pg_catalog.btrim(new.content);
    end if;
  end if;
  if old.deleted_at is not null or pg_catalog.pg_trigger_depth() = 1 then
    new.support_count := old.support_count;
    new.comments_count := old.comments_count;
  end if;
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create or replace function public.prepare_community_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_is_admin boolean := coalesce(public.is_admin(), false);
begin
  if tg_op = 'UPDATE' and pg_catalog.pg_trigger_depth() > 1
    and old.user_id is not null and new.user_id is null then
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

  new.content := pg_catalog.btrim(new.content);
  if tg_op = 'INSERT' then
    if current_user_id is not null then
      new.user_id := current_user_id;
      new.is_hidden := false;
      new.created_at := pg_catalog.statement_timestamp();
    end if;
    new.author_alias := public.get_or_create_community_alias(new.user_id);
    new.deleted_at := null;
  else
    new.id := old.id;
    new.user_id := old.user_id;
    new.author_alias := old.author_alias;
    new.created_at := old.created_at;
    new.post_id := old.post_id;
    if old.deleted_at is not null then
      new.deleted_at := old.deleted_at;
      new.is_hidden := true;
      new.content := old.content;
    elsif current_user_is_admin and old.user_id is distinct from current_user_id then
      new.deleted_at := old.deleted_at;
      new.content := old.content;
    elsif new.deleted_at is not null then
      new.deleted_at := pg_catalog.now();
      new.is_hidden := true;
      new.content := old.content;
    else
      new.deleted_at := old.deleted_at;
      new.is_hidden := old.is_hidden;
    end if;
  end if;
  new.updated_at := pg_catalog.statement_timestamp();
  return new;
end;
$$;

create function public.anonymize_community_before_account_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.community_posts as posts
  set user_id = null, author_alias = 'Compte supprimé', content = 'Publication supprimée avec le compte.'
  where posts.user_id = old.id;

  update public.community_comments as comments
  set user_id = null, author_alias = 'Compte supprimé', content = 'Commentaire supprimé avec le compte.'
  where comments.user_id = old.id;
  return old;
end;
$$;

create trigger anonymize_community_before_account_delete
before delete on auth.users
for each row execute function public.anonymize_community_before_account_delete();

revoke all on function public.anonymize_community_before_account_delete() from public, anon, authenticated;

create or replace function public.read_community_posts_feed()
returns table (
  id uuid, author_alias text, category text, content text,
  support_count integer, comments_count integer,
  created_at timestamptz, updated_at timestamptz, is_own boolean
)
language sql stable security definer set search_path = ''
as $$
  select posts.id, posts.author_alias, posts.category, posts.content,
    posts.support_count, posts.comments_count, posts.created_at, posts.updated_at,
    coalesce(posts.user_id = auth.uid(), false)
  from public.community_posts posts
  where not posts.is_hidden and posts.deleted_at is null;
$$;

create or replace function public.read_community_comments_feed()
returns table (
  id uuid, post_id uuid, author_alias text, content text,
  created_at timestamptz, updated_at timestamptz, is_own boolean
)
language sql stable security definer set search_path = ''
as $$
  select comments.id, comments.post_id, comments.author_alias, comments.content,
    comments.created_at, comments.updated_at,
    coalesce(comments.user_id = auth.uid(), false)
  from public.community_comments comments
  join public.community_posts posts on posts.id = comments.post_id
  where not comments.is_hidden and comments.deleted_at is null
    and not posts.is_hidden and posts.deleted_at is null;
$$;

-- Interdit commentaires et soutiens sur une publication tombstone.
drop policy if exists community_comments_insert_own_visible_post on public.community_comments;
create policy community_comments_insert_own_visible_post
on public.community_comments
for insert
to authenticated
with check (
  user_id = (select auth.uid()) and not is_hidden and exists (
    select 1 from public.community_posts as posts
    where posts.id = post_id and posts.user_id is not null
      and not posts.is_hidden and posts.deleted_at is null
  )
);

-- Refuse l'auto-signalement et borne les signalements historiques.
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
  new.created_at := pg_catalog.now();
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

-- Quotas de stockage principaux, sérialisés par utilisateur.
create function public.enforce_authenticated_row_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  current_rows bigint;
begin
  if actor_id is null then return new; end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('quota:' || tg_table_schema || '.' || tg_table_name || ':' || actor_id::text, 0)
  );
  execute pg_catalog.format('select count(*) from %I.%I where %I = $1', tg_table_schema, tg_table_name, tg_argv[0])
    into current_rows using actor_id;
  if current_rows >= tg_argv[1]::bigint then
    raise exception 'Quota de stockage atteint pour cette ressource.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger zz_emergency_contacts_quota before insert on public.emergency_contacts
for each row execute function public.enforce_authenticated_row_quota('user_id', '20');
create trigger zz_health_logs_quota before insert on public.health_logs
for each row execute function public.enforce_authenticated_row_quota('user_id', '20000');
create trigger zz_medications_quota before insert on public.medications
for each row execute function public.enforce_authenticated_row_quota('user_id', '200');
create trigger zz_community_posts_quota before insert on public.community_posts
for each row execute function public.enforce_authenticated_row_quota('user_id', '1000');
create trigger zz_community_comments_quota before insert on public.community_comments
for each row execute function public.enforce_authenticated_row_quota('user_id', '10000');

revoke all on function public.enforce_authenticated_row_quota() from public, anon, authenticated;

-- Le module SOS n'étant pas livré, ses écritures PostgREST restent fermées jusqu'à une migration dédiée.
revoke insert, update, delete on table public.emergency_contacts from authenticated;

create function public.validate_health_log_array_items()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item text;
begin
  foreach item in array coalesce(new.symptoms, array[]::text[]) loop
    if char_length(item) > 120 then
      raise exception 'Un symptôme déclaré dépasse la taille autorisée.' using errcode = '22001';
    end if;
  end loop;
  foreach item in array coalesce(new.possible_triggers, array[]::text[]) loop
    if char_length(item) > 120 then
      raise exception 'Un déclencheur déclaré dépasse la taille autorisée.' using errcode = '22001';
    end if;
  end loop;
  return new;
end;
$$;

create trigger health_logs_validate_array_items
before insert or update on public.health_logs
for each row execute function public.validate_health_log_array_items();

revoke all on function public.validate_health_log_array_items() from public, anon, authenticated;

-- Le serveur expose explicitement si une restauration est cohérente avec l'état courant de la cible.
create function public.can_restore_community_report(target_report_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  target_post_id uuid;
  target_comment_id uuid;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Accès administrateur requis.' using errcode = '42501';
  end if;
  select reports.post_id, reports.comment_id into target_post_id, target_comment_id
  from public.community_reports as reports where reports.id = target_report_id;
  if not found then return false; end if;
  if target_post_id is not null then
    return exists (
      select 1 from public.community_posts posts
      where posts.id = target_post_id and posts.user_id is not null
        and posts.is_hidden and posts.deleted_at is null
    );
  end if;
  return exists (
    select 1 from public.community_comments comments
    join public.community_posts posts on posts.id = comments.post_id
    where comments.id = target_comment_id and comments.user_id is not null
      and comments.is_hidden and comments.deleted_at is null
      and not posts.is_hidden and posts.deleted_at is null
  );
end;
$$;

revoke all on function public.can_restore_community_report(uuid) from public, anon;
grant execute on function public.can_restore_community_report(uuid) to authenticated;
