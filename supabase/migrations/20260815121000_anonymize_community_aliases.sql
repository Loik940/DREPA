-- Cette migration remplace les pseudonymes issus du profil privé par des alias communautaires non identifiants.
-- Elle met aussi à jour les contenus existants afin qu’un prénom réel ne reste pas visible dans la communauté.

update public.user_roles
set community_alias = 'Membre-' || upper(substr(md5(user_id::text), 1, 12))
where community_alias is not null;

alter table public.community_posts disable trigger protect_community_post_before_update;
alter table public.community_comments disable trigger community_comments_10_protect_update;

update public.community_posts as posts
set author_alias = roles.community_alias
from public.user_roles as roles
where roles.user_id = posts.user_id
  and roles.community_alias is not null;

update public.community_comments as comments
set author_alias = roles.community_alias
from public.user_roles as roles
where roles.user_id = comments.user_id
  and roles.community_alias is not null;

alter table public.community_posts enable trigger protect_community_post_before_update;
alter table public.community_comments enable trigger community_comments_10_protect_update;

create or replace function public.get_or_create_community_alias(target_user_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  stored_alias text;
begin
  if target_user_id is null then
    raise exception 'Un compte est requis pour créer le pseudonyme communautaire.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(target_user_id::text, 0)
  );

  select roles.community_alias
    into stored_alias
    from public.user_roles as roles
    where roles.user_id = target_user_id
    for update;

  if not found then
    raise exception 'Le rôle du compte est introuvable.'
      using errcode = 'P0002';
  end if;

  if stored_alias is null then
    stored_alias := 'Membre-' || pg_catalog.upper(pg_catalog.substr(pg_catalog.md5(target_user_id::text), 1, 12));
    update public.user_roles
    set community_alias = stored_alias
    where user_id = target_user_id;
  end if;

  return stored_alias;
end;
$$;

revoke all on function public.get_or_create_community_alias(uuid) from public, anon, authenticated;
