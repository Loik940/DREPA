grant usage on schema public to authenticated;

revoke all privileges on table public.profiles from anon;
revoke all privileges on table public.profiles from public;
grant select, insert, update, delete on table public.profiles to authenticated;

revoke all privileges on table public.emergency_contacts from anon;
revoke all privileges on table public.emergency_contacts from public;
grant select, insert, update, delete on table public.emergency_contacts to authenticated;

revoke all privileges on table public.user_consents from anon;
revoke all privileges on table public.user_consents from public;
grant select, insert, update on table public.user_consents to authenticated;
