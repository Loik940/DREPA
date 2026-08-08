-- Accorde les privilèges SQL minimaux à authenticated sans modifier la RLS ni ouvrir anon/public.
-- Ce droit permet aux utilisateurs authentifiés d’utiliser le schéma public.
grant usage on schema public to authenticated;

-- Ces droits protègent la table des profils et autorisent les opérations nécessaires.
revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from public;
grant select, insert, update, delete on table public.profiles to authenticated;

-- Ces droits protègent les contacts d’urgence et autorisent les opérations nécessaires.
revoke all privileges on table public.emergency_contacts from anon;
revoke all privileges on table public.emergency_contacts from public;
grant select, insert, update, delete on table public.emergency_contacts to authenticated;

-- Ces droits protègent les consentements et autorisent les opérations nécessaires.
revoke all privileges on table public.user_consents from anon;
revoke all privileges on table public.user_consents from public;
grant select, insert, update on table public.user_consents to authenticated;
