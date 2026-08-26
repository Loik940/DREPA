-- Autorise le soutien de sa propre publication tout en conservant l'idempotence et les limites anti-abus.
-- Cette règle est appliquée par la RPC serveur, pas seulement par l'interface mobile.

create or replace function public.set_community_post_support(target_post_id uuid, desired_state boolean)
returns table (has_supported boolean, support_count integer)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  post_available boolean;
  current_state boolean;
  final_count integer;
begin
  if actor_id is null then
    raise exception 'Session authentifiée requise.' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('community-support:' || actor_id::text, 0)
  );

  select not posts.is_hidden and posts.deleted_at is null and posts.user_id is not null
    into post_available
    from public.community_posts posts
   where posts.id = target_post_id
   for update;

  if not found then
    raise exception 'Publication introuvable.' using errcode = 'P0002';
  end if;

  select exists (
    select 1 from public.community_post_reactions reactions
    where reactions.post_id = target_post_id and reactions.user_id = actor_id
  ) into current_state;

  if current_state = desired_state then
    select posts.support_count into final_count
    from public.community_posts posts where posts.id = target_post_id;
    return query select current_state, final_count;
    return;
  end if;

  if (select count(*) from public.community_support_events events
      where events.user_id = actor_id
        and events.created_at >= pg_catalog.now() - interval '10 minutes') >= 30
    or (select count(*) from public.community_support_events events
      where events.user_id = actor_id
        and events.created_at >= pg_catalog.now() - interval '24 hours') >= 200 then
    raise exception 'Limite de changements de soutien atteinte.' using errcode = 'P0001';
  end if;

  if desired_state then
    if not post_available then
      raise exception 'Cette publication ne peut plus recevoir de soutien.' using errcode = '55000';
    end if;
    if (select count(*) from public.community_post_reactions reactions
        where reactions.user_id = actor_id) >= 2000 then
      raise exception 'Quota de soutiens actifs atteint.' using errcode = 'P0001';
    end if;
    insert into public.community_post_reactions (post_id, user_id, reaction_type)
    values (target_post_id, actor_id, 'support')
    on conflict (post_id, user_id) do nothing;
  else
    delete from public.community_post_reactions reactions
    where reactions.post_id = target_post_id and reactions.user_id = actor_id;
  end if;

  insert into public.community_support_events (user_id, post_id, desired_state)
  values (actor_id, target_post_id, desired_state);

  select exists (
    select 1 from public.community_post_reactions reactions
    where reactions.post_id = target_post_id and reactions.user_id = actor_id
  ), posts.support_count
    into current_state, final_count
    from public.community_posts posts
   where posts.id = target_post_id;

  return query select current_state, final_count;
end;
$$;

revoke all on function public.set_community_post_support(uuid, boolean) from public, anon;
grant execute on function public.set_community_post_support(uuid, boolean) to authenticated;
