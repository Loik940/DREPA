-- Vérifie les invariants de sécurité structurels après application complète des migrations.
begin;
select plan(12);

select ok(exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts'
    and policyname = 'community_posts_update_own'
), 'Les publications utilisent la policy propriétaire');

select ok(not exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'community_posts'
    and policyname = 'community_posts_update_authenticated'
), 'La policy admin directe des publications est supprimée');

select ok(exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = 'community_comments'
    and policyname = 'community_comments_update_own'
), 'Les commentaires utilisent la policy propriétaire');

select ok(not exists (
  select 1 from information_schema.role_column_grants
  where table_schema = 'public' and table_name = 'community_post_reactions'
    and grantee = 'authenticated' and column_name = 'user_id'
), 'Les UUID de réactions ne sont pas lisibles par authenticated');

select has_function('public', 'set_community_post_support', array['uuid', 'boolean']);
select has_function('public', 'accept_user_consents', array['text', 'text', 'text']);
select has_function('public', 'revoke_user_consents', array[]::text[]);
select has_function('public', 'can_restore_community_report', array['uuid']);

select ok((
  select delete_rule = 'SET NULL' from information_schema.referential_constraints
  where constraint_schema = 'public' and constraint_name = 'community_posts_user_id_fkey'
), 'La suppression de compte conserve les publications tombstones');

select ok((
  select delete_rule = 'SET NULL' from information_schema.referential_constraints
  where constraint_schema = 'public' and constraint_name = 'community_comments_user_id_fkey'
), 'La suppression de compte conserve les commentaires tombstones');

select ok(exists (
  select 1 from pg_trigger where tgname = 'zz_medication_reminders_quota' and not tgisinternal
), 'Le quota des rappels est actif');

select ok(not exists (
  select 1 from pg_constraint where connamespace = 'public'::regnamespace and not convalidated
), 'Toutes les contraintes public sont validées');

select * from finish();
rollback;
