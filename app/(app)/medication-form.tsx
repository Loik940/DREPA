// Formulaire Médicaments : enregistre un traitement prescrit et programme ses rappels locaux.
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm, useWatch, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckboxRow } from '@/components/ui/CheckboxRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { useCreateMedicationMutation } from '@/features/medications/mutations';
import { medicationDefaults, medicationSchema, type MedicationValues } from '@/features/medications/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function MedicationFormScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useCreateMedicationMutation(user?.id);
  const { control, handleSubmit, setError, formState } = useForm<MedicationValues>({ resolver: zodResolver(medicationSchema), defaultValues: medicationDefaults });
  const remindersEnabled = useWatch({ control, name: 'reminders_enabled' });

  const onSubmit = async (values: MedicationValues) => {
    try {
      await mutation.mutateAsync(values);
      router.replace('/(app)/(tabs)/medications');
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Le traitement ne peut pas être enregistré.' });
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Ajouter un médicament</AppText>
        <AppText color="textSecondary">Renseigne uniquement les informations indiquées par ton professionnel de santé.</AppText>
      </View>
      <StatusBanner tone="warning" message="DRÉPA ne prescrit aucun médicament et ne modifie aucun dosage." />
      <Card>
        <View style={styles.form}>
          <MedicationField control={control} name="name" label="Nom du médicament" />
          <MedicationField control={control} name="dosage" label="Dosage prescrit" placeholder="Ex. 500 mg, 1 comprimé" />
          <MedicationField control={control} name="frequency" label="Fréquence prescrite" placeholder="Ex. Quotidien, 2 fois par jour" />
          <MedicationField control={control} name="start_date" label="Date de début" placeholder="AAAA-MM-JJ" />
          <MedicationField control={control} name="end_date" label="Date de fin (facultatif)" placeholder="AAAA-MM-JJ" />
          <Controller control={control} name="reminders_enabled" render={({ field, fieldState }) => <CheckboxRow checked={field.value} label="Activer les rappels locaux" onChange={field.onChange} error={fieldState.error?.message} />} />
          {remindersEnabled && <MedicationField control={control} name="reminder_times" label="Heure(s) de rappel" placeholder="08:00, 20:00" helperText="Sépare plusieurs heures par une virgule." />}
          <MedicationField control={control} name="notes" label="Notes personnelles (facultatif)" multiline />
        </View>
      </Card>
      {formState.errors.root?.message && <AppText color="sos">{formState.errors.root.message}</AppText>}
      <Button label="Enregistrer le traitement" loading={formState.isSubmitting || mutation.isPending} onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}

function MedicationField({ control, name, label, placeholder, helperText, multiline = false }: { control: Control<MedicationValues>; name: FieldPath<MedicationValues>; label: string; placeholder?: string; helperText?: string; multiline?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <TextField label={label} value={typeof field.value === 'string' ? field.value : ''} onBlur={field.onBlur} onChangeText={field.onChange} placeholder={placeholder} helperText={helperText} error={fieldState.error?.message} multiline={multiline} numberOfLines={multiline ? 4 : undefined} />} />;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  form: { gap: spacing.lg },
});
