// Recueille un signalement destiné à la modération humaine.
// Accepte une publication ou un commentaire comme cible unique.
// Valide le motif et les précisions avant l’envoi.
// Utilise uniquement l’identité de la session authentifiée.
// N’expose aucune erreur technique ni donnée privée.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { reportReasonLabels } from '@/features/community/categories';
import { CommunityDataError } from '@/features/community/errors';
import {
  useReportMutation,
  type CommunityReportTarget,
} from '@/features/community/mutations';
import { reportSchema, type ReportValues } from '@/features/community/schemas';
import { SingleChoiceChips } from '@/features/health-log/components/ChoiceChips';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

function getReportTarget(postId: string | undefined, commentId: string | undefined): CommunityReportTarget | null {
  if (!postId) return null;
  if (commentId) return { type: 'comment', postId, commentId };
  return { type: 'post', postId };
}

function getReportErrorMessage(error: Error | null): string {
  if (error instanceof CommunityDataError && error.kind === 'duplicate') {
    return 'Un signalement pour ce contenu a déjà été enregistré.';
  }
  if (error instanceof CommunityDataError && error.kind === 'rate_limit') {
    return 'Le signalement ne peut pas être envoyé maintenant. Réessayez plus tard.';
  }
  return 'Le signalement ne peut pas être envoyé pour le moment.';
}

export default function CommunityReportScreen() {
  const router = useRouter();
  const { postId, commentId } = useLocalSearchParams<{ postId?: string; commentId?: string }>();
  const { user } = useAuth();
  const reportMutation = useReportMutation(user?.id);
  const reportLockRef = useRef(false);
  const [submitted, setSubmitted] = useState(false);
  const target = getReportTarget(postId, commentId);
  const { control, handleSubmit, setError, formState } = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: 'other', details: '' },
  });

  if (!target) {
    return <ErrorState title="Signalement indisponible" description="Le contenu à signaler ne peut pas être identifié." />;
  }

  const onSubmit = async (values: ReportValues) => {
    if (reportLockRef.current) return;
    reportLockRef.current = true;
    try {
      await reportMutation.mutateAsync({ target, values });
      setSubmitted(true);
    } catch (error) {
      setError('root', {
        message: getReportErrorMessage(error instanceof Error ? error : null),
      });
    } finally {
      reportLockRef.current = false;
    }
  };

  if (submitted) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.confirmation}>
          <AppText variant="title" align="center">Signalement envoyé</AppText>
          <StatusBanner
            tone="success"
            message="Votre signalement a été transmis à l’équipe de modération pour un examen humain."
          />
          <Button label="Retour" onPress={() => router.back()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <AppText variant="title">Signaler un contenu</AppText>
      <StatusBanner
        tone="warning"
        message="Chaque signalement est examiné par une personne. Utilisez ce formulaire uniquement pour un problème réel."
      />

      <View style={styles.fieldGroup}>
        <AppText variant="label">Motif du signalement</AppText>
        <Controller
          control={control}
          name="reason"
          render={({ field, fieldState }) => (
            <>
              <SingleChoiceChips
                choices={reportReasonLabels}
                selected={field.value}
                onChange={(value) => {
                  if (value) field.onChange(value);
                }}
              />
              {fieldState.error?.message ? <AppText variant="caption" color="sos">{fieldState.error.message}</AppText> : null}
            </>
          )}
        />
      </View>

      <Controller
        control={control}
        name="details"
        render={({ field, fieldState }) => (
          <TextField
            label="Précisions (facultatif)"
            multiline
            maxLength={500}
            numberOfLines={6}
            placeholder="Décrivez brièvement le problème"
            value={field.value ?? ''}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
            style={styles.textArea}
          />
        )}
      />

      {formState.errors.root?.message ? (
        <AppText accessibilityRole="alert" color="sos">{formState.errors.root.message}</AppText>
      ) : null}
      <Button
        label="Envoyer le signalement"
        loading={formState.isSubmitting || reportMutation.isPending}
        onPress={() => void handleSubmit(onSubmit)()}
      />
      <Button label="Annuler" variant="ghost" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  confirmation: { flex: 1, gap: spacing.lg, justifyContent: 'center' },
  fieldGroup: { gap: spacing.sm },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
});
