// Formulaire du journal : saisit des données de santé déclarées et les enregistre via RLS.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { ChoiceChips, SingleChoiceChips } from '@/features/health-log/components/ChoiceChips';
import { ScoreSelector } from '@/features/health-log/components/ScoreSelector';
import { useCreateHealthLogMutation, useUpdateHealthLogMutation } from '@/features/health-log/mutations';
import { hydrationChoices, medicationChoices, symptomChoices, triggerChoices } from '@/features/health-log/options';
import { useHealthLogQuery } from '@/features/health-log/queries';
import { healthLogDefaults, healthLogSchema, type HealthLogValues } from '@/features/health-log/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const painLocationChoices = [
  { label: 'Dos', value: 'back' },
  { label: 'Jambes', value: 'legs' },
  { label: 'Ventre', value: 'abdomen' },
  { label: 'Bras', value: 'arms' },
  { label: 'Poitrine', value: 'chest' },
  { label: 'Tête', value: 'head' },
  { label: 'Partout', value: 'everywhere' },
  { label: 'Autre', value: 'other' },
] as const;

export default function HealthEntryScreen() {
  // Les hooks préparent la navigation, l’entrée éventuelle et le formulaire validé.
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const entryQuery = useHealthLogQuery(user?.id, id);
  const createMutation = useCreateHealthLogMutation(user?.id);
  const updateMutation = useUpdateHealthLogMutation(user?.id, id);
  const isEditing = Boolean(id);
  const { control, handleSubmit, reset, setError, formState } = useForm<HealthLogValues>({
    resolver: zodResolver(healthLogSchema),
    defaultValues: healthLogDefaults,
  });

  // En édition, les données chargées remplissent le formulaire existant.
  useEffect(() => {
    if (!entryQuery.data) return;
    reset({
      pain_level: entryQuery.data.pain_level,
      pain_location: entryQuery.data.pain_location ?? '',
      temperature: entryQuery.data.temperature?.toString().replace('.', ',') ?? '',
      hydration_level: entryQuery.data.hydration_level as HealthLogValues['hydration_level'],
      fatigue_level: entryQuery.data.fatigue_level,
      symptoms: entryQuery.data.symptoms ?? [],
      possible_triggers: entryQuery.data.possible_triggers ?? [],
      medication_taken: entryQuery.data.medication_taken,
      notes: entryQuery.data.notes ?? '',
      recorded_at: entryQuery.data.recorded_at,
    });
  }, [entryQuery.data, reset]);

  // Après validation, l’appel serveur crée ou met à jour l’entrée selon le contexte.
  const onSubmit = async (values: HealthLogValues) => {
    try {
      const savedEntry = isEditing
        ? await updateMutation.mutateAsync(values)
        : await createMutation.mutateAsync(values);
      // Une sauvegarde réussie ouvre le détail de l’entrée enregistrée.
      router.replace({ pathname: '/(app)/health-log/[id]', params: { id: savedEntry.id } });
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'L’entrée ne peut pas être enregistrée.' });
    }
  };

  // En édition, le chargement et l’erreur sont traités avant le formulaire.
  if (isEditing && entryQuery.isPending) {
    return <LoadingState message="Chargement de l’entrée..." />;
  }

  if (isEditing && entryQuery.isError) {
    return <ErrorState description={entryQuery.error.message} onRetry={() => void entryQuery.refetch()} />;
  }

  const mutationPending = createMutation.isPending || updateMutation.isPending;

  // Le rendu principal regroupe les différentes sections de saisie déclarative.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">{isEditing ? 'Modifier l’entrée' : 'Comment tu te sens ?'}</AppText>
        <AppText color="textSecondary">Tous les champs sont facultatifs. L’heure est enregistrée au moment de la sauvegarde.</AppText>
      </View>

      <StatusBanner message="Ces informations sont déclarées par toi et ne constituent pas un diagnostic médical." />

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Niveau de douleur</AppText>
          <Controller control={control} name="pain_level" render={({ field }) => <ScoreSelector label="Niveau de douleur" value={field.value} onChange={field.onChange} />} />
          <AppText variant="label" color="textSecondary">Localisation (facultatif)</AppText>
          <Controller
            control={control}
            name="pain_location"
            render={({ field }) => (
              <SingleChoiceChips choices={painLocationChoices} selected={field.value || null} onChange={field.onChange} />
            )}
          />
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Fatigue et hydratation</AppText>
          <Controller control={control} name="fatigue_level" render={({ field }) => <ScoreSelector label="Niveau de fatigue" value={field.value} onChange={field.onChange} />} />
          <View style={styles.subsection}>
            <AppText variant="label" color="textSecondary">Hydratation déclarée</AppText>
            <Controller control={control} name="hydration_level" render={({ field }) => <SingleChoiceChips choices={hydrationChoices} selected={field.value} onChange={field.onChange} />} />
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Symptômes</AppText>
          <Controller control={control} name="symptoms" render={({ field }) => <ChoiceChips choices={symptomChoices} selected={field.value} onChange={field.onChange} />} />
        </View>
      </Card>

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Facteurs possibles</AppText>
          <Controller control={control} name="possible_triggers" render={({ field }) => <ChoiceChips choices={triggerChoices} selected={field.value} onChange={field.onChange} />} />
        </View>
      </Card>

      <Controller control={control} name="temperature" render={({ field, fieldState }) => <TextField label="Température (facultatif)" keyboardType="decimal-pad" placeholder="Ex. 37,2" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} helperText="Valeur déclarée par toi." />} />

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Médicaments prescrits</AppText>
          <AppText color="textSecondary">As-tu pris tes médicaments prescrits aujourd’hui ?</AppText>
          <Controller
            control={control}
            name="medication_taken"
            render={({ field }) => (
              <SingleChoiceChips
                choices={medicationChoices}
                selected={field.value === null ? 'unset' : field.value ? 'yes' : 'no'}
                onChange={(value) => field.onChange(value === 'yes' ? true : value === 'no' ? false : null)}
              />
            )}
          />
        </View>
      </Card>

      <Controller control={control} name="notes" render={({ field, fieldState }) => <TextField label="Notes personnelles (facultatif)" multiline numberOfLines={5} placeholder="Ajoute une note si tu le souhaites" value={field.value ?? ''} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} style={styles.notes} />} />

      {formState.errors.root?.message && <AppText color="sos">{formState.errors.root.message}</AppText>}
      <Button label={isEditing ? 'Enregistrer les modifications' : 'Enregistrer mon état'} loading={formState.isSubmitting || mutationPending} onPress={handleSubmit(onSubmit)} />
      <Button label="Annuler" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  section: { gap: spacing.lg },
  subsection: { gap: spacing.sm },
  notes: { minHeight: 120, textAlignVertical: 'top' },
});
