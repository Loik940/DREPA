// Formulaire Médicaments : enregistre un traitement prescrit et programme ses rappels locaux.
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckboxRow } from '@/components/ui/CheckboxRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { DatePickerField } from '@/features/medications/components/DatePickerField';
import { ReminderTimesField } from '@/features/medications/components/ReminderTimesField';
import { useCreateMedicationMutation } from '@/features/medications/mutations';
import { scheduleMedicationReminderTest } from '@/features/medications/notifications';
import { medicationDefaults, medicationSchema, type MedicationValues } from '@/features/medications/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function MedicationFormScreen() {
  // Les hooks préparent la navigation, l’utilisateur, la mutation et le formulaire validé.
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useCreateMedicationMutation(user?.id);
  const { control, handleSubmit, setError, formState } = useForm<MedicationValues>({ resolver: zodResolver(medicationSchema), defaultValues: medicationDefaults });
  const remindersEnabled = useWatch({ control, name: 'reminders_enabled' });
  const startDate = useWatch({ control, name: 'start_date' });
  const [notificationTestStatus, setNotificationTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Après validation, le traitement est enregistré par l’appel serveur prévu.
  const onSubmit = async (values: MedicationValues) => {
    try {
      await mutation.mutateAsync(values);
      // Une sauvegarde réussie ramène vers la liste des médicaments.
      router.replace('/(app)/(tabs)/medications');
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Le traitement ne peut pas être enregistré.' });
    }
  };

  // Le test vérifie uniquement l’autorisation et la réception d’un message local générique.
  const testNotifications = async () => {
    setNotificationTestStatus('loading');
    try {
      await scheduleMedicationReminderTest();
      setNotificationTestStatus('success');
    } catch {
      setNotificationTestStatus('error');
    }
  };

  // Le rendu principal affiche les informations prescrites et les rappels facultatifs.
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
          <Controller control={control} name="start_date" render={({ field, fieldState }) => <DatePickerField label="Date de début" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />} />
          <Controller control={control} name="end_date" render={({ field, fieldState }) => <DatePickerField allowClear label="Date de fin (facultatif)" minimumDate={startDate} value={field.value ?? ''} onChange={field.onChange} error={fieldState.error?.message} />} />
          <Controller control={control} name="reminders_enabled" render={({ field, fieldState }) => <CheckboxRow checked={field.value} label="Activer les rappels locaux" onChange={field.onChange} error={fieldState.error?.message} />} />
          {remindersEnabled ? (
            <View style={styles.reminders}>
              <Controller control={control} name="reminder_times" render={({ field, fieldState }) => <ReminderTimesField label="Heure(s) de rappel" value={field.value} onChange={field.onChange} error={fieldState.error?.message} helperText="Ajoute les heures prévues pour tes rappels locaux." />} />
              <Button label="Tester les notifications" loading={notificationTestStatus === 'loading'} onPress={testNotifications} variant="secondary" />
              {notificationTestStatus === 'success' ? <StatusBanner tone="success" message="Une notification de test sera affichée dans environ 10 secondes." /> : null}
              {notificationTestStatus === 'error' ? <StatusBanner tone="error" message="Le test n’a pas pu être programmé. Vérifie les autorisations de notification." /> : null}
            </View>
          ) : null}
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
  reminders: { gap: spacing.md },
});
