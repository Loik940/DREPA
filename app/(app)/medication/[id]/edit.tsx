// Cet écran permet de modifier un traitement déjà saisi par l’utilisateur.
// Il charge le traitement et ses horaires avec les filtres id et user_id.
// Il remplit le formulaire partagé sans accès Supabase dans le composant UI.
// Il conserve les horaires inchangés et délègue leur synchronisation à la mutation.
// Il ne formule aucune recommandation et ne modifie aucun dosage automatiquement.
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { MedicationForm } from '@/features/medications/components/MedicationForm';
import { MedicationDataError } from '@/features/medications/errors';
import { useUpdateMedicationMutation } from '@/features/medications/mutations';
import { useMedicationDetailQuery } from '@/features/medications/queries';
import type { MedicationValues } from '@/features/medications/schemas';
import { useAuth } from '@/providers/auth-provider';

export default function MedicationEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const query = useMedicationDetailQuery(user?.id, id);
  const mutation = useUpdateMedicationMutation(user?.id, id);

  if (query.isPending) return <LoadingState message="Chargement du traitement..." />;
  if (query.isError) {
    const notFound = query.error instanceof MedicationDataError && query.error.kind === 'not_found';
    return <ErrorState title={notFound ? 'Traitement introuvable' : undefined} description={query.error.message} onRetry={notFound ? undefined : () => void query.refetch()} />;
  }

  const { medication, reminders } = query.data;
  const defaultValues: MedicationValues = {
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    start_date: medication.start_date,
    end_date: medication.end_date ?? '',
    reminder_times: reminders.map((reminder) => reminder.reminder_time.slice(0, 5)).join(', '),
    reminders_enabled: reminders.length > 0,
    notes: medication.notes ?? '',
  };

  // Après une synchronisation complète, la route revient au détail du même traitement.
  const onSubmit = async (values: MedicationValues) => {
    await mutation.mutateAsync(values);
    router.replace(`/(app)/medication/${id}` as Href);
  };

  return (
    <MedicationForm
      title="Modifier le traitement"
      description="Modifie uniquement les informations de ton traitement prescrit."
      defaultValues={defaultValues}
      submitLabel="Enregistrer les modifications"
      loading={mutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
