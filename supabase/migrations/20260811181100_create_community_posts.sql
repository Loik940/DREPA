-- Crée la table des publications communautaires et ses contraintes de validation.
-- Chaque publication appartient au compte authentifié qui l’envoie.
-- L’alias public est préparé côté base de données.
-- Les compteurs et la visibilité restent protégés des écritures mobiles.
-- Les catégories autorisées correspondent au périmètre initial de la communauté.
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_alias text not null,
  category text not null check (
    category in ('testimony', 'question', 'motivation', 'daily_life', 'resources')
  ),
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  support_count integer not null default 0 check (support_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  is_hidden boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexe les recherches par auteur, catégorie, visibilité et date de publication.
create index community_posts_user_id_created_at_idx
  on public.community_posts (user_id, created_at desc);
create index community_posts_category_created_at_idx
  on public.community_posts (category, created_at desc);
create index community_posts_visible_created_at_idx
  on public.community_posts (created_at desc)
  where is_hidden = false and deleted_at is null;

-- Attribue un pseudonyme fiable et limite chaque membre à cinq publications en dix minutes.
create or replace function public.prepare_community_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  recent_posts_count integer;
begin
  if authenticated_user_id is not null then
    new.user_id := authenticated_user_id;
  end if;

  new.support_count := 0;
  new.comments_count := 0;
  new.is_hidden := false;
  new.deleted_at := null;
  new.content := pg_catalog.btrim(new.content);

  new.author_alias := public.get_or_create_community_alias(new.user_id);

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text, 0)
  );

  select count(*)
    into recent_posts_count
    from public.community_posts as posts
   where posts.user_id = new.user_id
     and posts.created_at >= pg_catalog.now() - interval '10 minutes';

  if recent_posts_count >= 5 then
    raise exception 'Limite de cinq publications en dix minutes atteinte.'
      using errcode = 'P0001';
  end if;

  new.created_at := pg_catalog.now();
  new.updated_at := new.created_at;
  return new;
end;
$$;

create trigger prepare_community_post_before_insert
before insert on public.community_posts
for each row execute function public.prepare_community_post();

-- Protège les champs gérés par le système lors des modifications non administratives.
create or replace function public.protect_community_post_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.id := old.id;
  new.user_id := old.user_id;
  new.author_alias := old.author_alias;
  new.created_at := old.created_at;

  if old.deleted_at is not null then
    new.deleted_at := old.deleted_at;
    new.is_hidden := true;
    new.content := old.content;
    new.category := old.category;
    new.support_count := old.support_count;
    new.comments_count := old.comments_count;
  elsif not coalesce(public.is_admin(), false) then
    if old.deleted_at is null and new.deleted_at is not null then
      new.deleted_at := pg_catalog.now();
      new.is_hidden := true;
      new.content := old.content;
      new.category := old.category;
    else
      new.deleted_at := old.deleted_at;
      new.is_hidden := old.is_hidden;
    end if;
  else
    new.deleted_at := null;
    new.content := pg_catalog.btrim(new.content);
  end if;

  if old.deleted_at is null
    and (coalesce(public.is_admin(), false) or new.deleted_at is null) then
    new.content := pg_catalog.btrim(new.content);
  end if;

  -- Seuls les triggers de compteurs peuvent modifier ces deux valeurs.
  if old.deleted_at is not null or pg_catalog.pg_trigger_depth() = 1 then
    new.support_count := old.support_count;
    new.comments_count := old.comments_count;
  end if;

  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger protect_community_post_before_update
before update on public.community_posts
for each row execute function public.protect_community_post_update();

-- Active les règles d'accès authentifiées et retire tout droit anonyme ou public.
alter table public.community_posts enable row level security;

create policy community_posts_select_authenticated
on public.community_posts
for select
to authenticated
using (
  (not is_hidden and deleted_at is null)
  or user_id = auth.uid()
  or public.is_admin()
);

create policy community_posts_insert_authenticated
on public.community_posts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and not is_hidden
);

create policy community_posts_update_authenticated
on public.community_posts
for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
)
with check (
  user_id = auth.uid()
  or public.is_admin()
);

-- Cette vue expose le fil sans révéler les identifiants des membres.
create view public.community_posts_feed
with (security_barrier = true)
as
select
  posts.id,
  posts.author_alias,
  posts.category,
  posts.content,
  posts.support_count,
  posts.comments_count,
  posts.created_at,
  posts.updated_at,
  posts.user_id = auth.uid() as is_own
from public.community_posts as posts
where not posts.is_hidden
  and posts.deleted_at is null;

revoke all on table public.community_posts from public, anon;
revoke all on table public.community_posts_feed from public, anon;
revoke all on function public.prepare_community_post() from public, anon;
revoke all on function public.protect_community_post_update() from public, anon;

-- Sans droit DELETE mobile, supprimer puis recréer ne contourne plus l’anti-spam.
grant select (id, is_hidden, deleted_at) on table public.community_posts to authenticated;
grant insert, update on table public.community_posts to authenticated;
grant select on table public.community_posts_feed to authenticated;
