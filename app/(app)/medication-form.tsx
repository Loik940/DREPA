// Route de création : relie le formulaire partagé à la session et à la mutation Supabase.
import { useRouter } from 'expo-router';

import { MedicationForm } from '@/features/medications/components/MedicationForm';
import { useCreateMedicationMutation } from '@/features/medications/mutations';
import { medicationDefaults, type MedicationValues } from '@/features/medications/schemas';
import { useAuth } from '@/providers/auth-provider';

export default function MedicationFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useCreateMedicationMutation(user?.id);

  // Une création complète revient à la liste, après l’écriture et la programmation des rappels.
  const onSubmit = async (values: MedicationValues) => {
    await mutation.mutateAsync(values);
    router.replace('/(app)/(tabs)/medications');
  };

  return (
    <MedicationForm
      title="Ajouter un médicament"
      description="Renseigne uniquement les informations indiquées par ton professionnel de santé."
      defaultValues={medicationDefaults}
      submitLabel="Enregistrer le traitement"
      loading={mutation.isPending}
      onSubmit={onSubmit}
    />
  );
}
