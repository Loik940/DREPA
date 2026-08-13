// Propose seulement les décisions permises pour le signalement.
// Valide le choix et la note avec le schéma partagé.
// Laisse l’administrateur choisir chaque décision explicitement.
// Compte les caractères de la note facultative.
// Rappelle que chaque décision reste enregistrée.
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { SingleChoiceChips } from '@/features/health-log/components/ChoiceChips';
import { spacing } from '@/theme/spacing';
import {
  canRestore,
  moderationDecisionSchema,
  type ModerationDecisionValues,
} from '../schemas';
import type { ModerationDecision, ModerationReport } from '../types';

type ModerationDecisionFormProps = {
  report: ModerationReport;
  loading: boolean;
  onSubmit: (values: ModerationDecisionValues) => void | Promise<void>;
  error?: string;
};

const pendingChoices = [
  { label: 'Masquer le contenu', value: 'hide' },
  { label: 'Rejeter le signalement', value: 'dismiss' },
] as const satisfies readonly { label: string; value: ModerationDecision }[];

const restoreChoice = [
  { label: 'Restaurer le contenu', value: 'restore' },
] as const satisfies readonly { label: string; value: ModerationDecision }[];

export function ModerationDecisionForm({
  report,
  loading,
  onSubmit,
  error,
}: ModerationDecisionFormProps) {
  const choices = report.status === 'pending' ? pendingChoices : canRestore(report) ? restoreChoice : [];
  const { control, handleSubmit, formState } = useForm<ModerationDecisionValues>({
    resolver: zodResolver(moderationDecisionSchema),
    defaultValues: { note: '' },
    mode: 'onChange',
  });

  if (choices.length === 0) return null;

  return (
    <Card style={styles.form}>
      <AppText variant="sectionTitle">Décision</AppText>
      <Controller
        control={control}
        name="decision"
        render={({ field, fieldState }) => (
          <View style={styles.field}>
            <AppText variant="label">Action à appliquer</AppText>
            <SingleChoiceChips
              choices={choices}
              selected={field.value ?? null}
              onChange={(value) => field.onChange(value ?? undefined)}
            />
            {fieldState.error ? (
              <AppText accessibilityRole="alert" variant="caption" color="sos">
                Choisissez une décision.
              </AppText>
            ) : null}
          </View>
        )}
      />
      <Controller
        control={control}
        name="note"
        render={({ field, fieldState }) => (
          <TextField
            label="Note facultative"
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            helperText={`${field.value?.length ?? 0}/500 caractères`}
            maxLength={500}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        )}
      />
      <View accessibilityRole="alert" style={styles.warning}>
        <AppText color="warning">
          Cette décision sera enregistrée dans l’historique de modération.
        </AppText>
      </View>
      {error ? (
        <AppText accessibilityRole="alert" color="sos">
          {error}
        </AppText>
      ) : null}
      <Button
        label="Confirmer"
        loading={loading}
        disabled={!formState.isValid}
        onPress={() => void handleSubmit(onSubmit)()}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  field: { gap: spacing.sm },
  warning: { paddingVertical: spacing.sm },
});
