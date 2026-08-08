-- Consent versions are append-only history owned by the authenticated user.
-- Cette table conserve l’historique des consentements.
create table public.user_consents (
  id uuid primary key default gen_random_uuid(),
  -- Cette contrainte relie le consentement à son propriétaire authentifié.
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  community_guidelines_version text not null,
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- Cet index accélère la recherche des consentements d’un utilisateur.
create index user_consents_user_id_idx
on public.user_consents(user_id);

-- Cet index accélère la recherche des versions de consentement actives.
create index user_consents_current_versions_idx
on public.user_consents(user_id, terms_version, privacy_version, community_guidelines_version, accepted_at desc)
where revoked_at is null;

-- Cette fonction prépare le contrôle utilisé par le trigger d’historique.
create or replace function public.prevent_consent_history_mutation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.user_id <> old.user_id
    or new.terms_version <> old.terms_version
    or new.privacy_version <> old.privacy_version
    or new.community_guidelines_version <> old.community_guidelines_version
    or new.accepted_at <> old.accepted_at
    or (old.revoked_at is not null and new.revoked_at is distinct from old.revoked_at) then
    raise exception 'Consent history is immutable';
  end if;

  return new;
end;
$$;

-- Ce trigger empêche la modification des données historiques protégées.
create trigger user_consents_history_immutable
before update on public.user_consents
for each row execute function public.prevent_consent_history_mutation();

-- La RLS protège chaque consentement enregistré.
alter table public.user_consents enable row level security;

-- Ces policies limitent les opérations au propriétaire du consentement.
create policy "user_consents_select_own"
on public.user_consents
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "user_consents_insert_own"
on public.user_consents
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "user_consents_revoke_own"
on public.user_consents
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
