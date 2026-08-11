-- Cette migration ajoute les informations nécessaires au report local d’un rappel.
-- Elle complète uniquement la table des prises déjà protégée par la RLS.
-- L’heure reportée reste liée à la déclaration de l’utilisateur authentifié.
-- L’identifiant de notification locale est borné pour éviter une valeur excessive.
-- Aucun traitement, dosage ou secret n’est ajouté au schéma.

-- Ces colonnes mémorisent l’heure effective du report et sa notification locale.
alter table public.medication_intakes
add column snoozed_until timestamptz,
add column snooze_notification_id text;

-- Ces contraintes gardent un report complet et interdisent une heure reportée pour un autre statut.
alter table public.medication_intakes
add constraint medication_intakes_snooze_notification_id_length
  check (snooze_notification_id is null or char_length(snooze_notification_id) <= 200),
add constraint medication_intakes_snoozed_until_status
  check (
    (status = 'snoozed' and snoozed_until is not null)
    or (status <> 'snoozed' and snoozed_until is null)
  );

-- Cet index accélère la recherche des reports actifs du seul utilisateur concerné.
create index medication_intakes_user_snoozed_until_idx
on public.medication_intakes(user_id, snoozed_until)
where status = 'snoozed';
