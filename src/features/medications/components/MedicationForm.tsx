// Ce composant partage le formulaire de création et d’édition d’un traitement déclaré.
// Il valide les champs et utilise les sélecteurs natifs de date et d’heure.
// Il peut tester une notification locale générique sans exposer le traitement.
// Il ne lit ni n’écrit directement dans Supabase et ne connaît pas la session.
// Il ne propose aucun médicament, dosage, fréquence ou conseil médical.
import { zodResolver } from '@hookform/resolvers/zod';
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
import { spacing } from '@/theme/spacing';
import { scheduleMedicationReminderTest } from '../notifications';
import { medicationSchema, type MedicationValues } from '../schemas';
import { DatePickerField } from './DatePickerField';
import { ReminderTimesField } from './ReminderTimesField';

type MedicationFormProps = {
  title: string;
  description: string;
  defaultValues: MedicationValues;
  submitLabel: string;
  loading: boolean;
  onSubmit: (values: MedicationValues) => Promise<void>;
};

export function MedicationForm({ title, description, defaultValues, submitLabel, loading, onSubmit }: MedicationFormProps) {
  const { control, handleSubmit, setError, formState } = useForm<MedicationValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues,
  });
  const remindersEnabled = useWatch({ control, name: 'reminders_enabled' });
  const startDate = useWatch({ control, name: 'start_date' });
  const [notificationTestStatus, setNotificationTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Les erreurs de sauvegarde restent dans le formulaire sans exposer un détail serveur.
  const submit = async (values: MedicationValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Le traitement ne peut pas être enregistré.' });
    }
  };

  // Le test vérifie seulement l’autorisation et la réception d’un message local générique.
  const testNotifications = async () => {
    setNotificationTestStatus('loading');
    try {
      await scheduleMedicationReminderTest();
      setNotificationTestStatus('success');
    } catch {
      setNotificationTestStatus('error');
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">{title}</AppText>
        <AppText color="textSecondary">{description}</AppText>
      </View>
      <StatusBanner tone="warning" message="DRÉPA ne prescrit aucun médicament et ne modifie aucun dosage." />
      <Card>
        <View style={styles.form}>
          <MedicationField control={control} name="name" label="Nom du médicament" />
          <MedicationField control={control} name="dosage" label="Dosage prescrit" />
          <MedicationField control={control} name="frequency" label="Fréquence prescrite" />
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
      {formState.errors.root?.message ? <AppText accessibilityRole="alert" color="sos">{formState.errors.root.message}</AppText> : null}
      <Button label={submitLabel} loading={formState.isSubmitting || loading} onPress={handleSubmit(submit)} />
    </ScreenContainer>
  );
}

function MedicationField({ control, name, label, multiline = false }: { control: Control<MedicationValues>; name: FieldPath<MedicationValues>; label: string; multiline?: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <TextField label={label} value={typeof field.value === 'string' ? field.value : ''} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} multiline={multiline} numberOfLines={multiline ? 4 : undefined} />} />;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  form: { gap: spacing.lg },
  reminders: { gap: spacing.md },
});
