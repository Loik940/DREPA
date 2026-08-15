// Écran de consentement : enregistre les versions acceptées avant l’accès au profil.
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckboxRow } from '@/components/ui/CheckboxRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { legalVersions } from '@/constants/legal-versions';
import { useAcceptConsentMutation } from '@/features/profile/mutations';
import { consentSchema, type ConsentValues } from '@/features/profile/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function ConsentScreen() {
  // Les hooks préparent la navigation, l’utilisateur, la mutation et le formulaire validé.
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useAcceptConsentMutation(user?.id ?? '');
  const { control, handleSubmit, setError, formState } = useForm<ConsentValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: { termsAccepted: false, privacyAccepted: false, communityAccepted: false },
  });

  // La session est vérifiée avant tout enregistrement des consentements.
  const onSubmit = async (values: ConsentValues) => {
    if (!user?.id) {
      setError('root', { message: 'La session utilisateur est indisponible.' });
      return;
    }

    // Après validation, les versions acceptées sont enregistrées par le serveur.
    try {
      await mutation.mutateAsync(values);
      // Une sauvegarde réussie ouvre l’étape suivante de l’onboarding.
      router.replace('/(app)/complete-profile');
    } catch {
      setError('root', { message: 'Les consentements ne peuvent pas être enregistrés.' });
    }
  };

  // Le rendu principal présente chaque accord et les limites du service.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Avant de commencer</AppText>
        <AppText color="textSecondary">Lis ces informations importantes avant de continuer.</AppText>
      </View>

      <Button label="Lire les informations de consentement" variant="secondary" onPress={() => router.push('/(auth)/legal')} />

      <ConsentCard control={control} name="termsAccepted" title="Conditions d’utilisation" label="J’ai lu et j’accepte les conditions d’utilisation." />
      <ConsentCard control={control} name="privacyAccepted" title="Confidentialité" label="J’ai lu et j’accepte la politique de confidentialité." />
      <ConsentCard control={control} name="communityAccepted" title="Charte communautaire" label="J’ai lu et j’accepte la charte communautaire." />

      <StatusBanner
        tone="info"
        message="DRÉPA est un outil d’accompagnement. L’application ne remplace pas un médecin, un diagnostic ou un traitement."
      />
      <AppText variant="caption" color="textSecondary">Versions : {legalVersions.terms}, {legalVersions.privacy}, {legalVersions.communityGuidelines}.</AppText>
      {formState.errors.root?.message && <AppText accessibilityRole="alert" color="sos">{formState.errors.root.message}</AppText>}
      <Button label="Continuer" loading={formState.isSubmitting || mutation.isPending} onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}

function ConsentCard({ control, name, title, label }: { control: Control<ConsentValues>; name: FieldPath<ConsentValues>; title: string; label: string }) {
  return (
    <Card>
      <View style={styles.cardContent}>
        <AppText variant="sectionTitle">{title}</AppText>
        <AppText color="textSecondary">Consulte les informations avant de donner ton accord.</AppText>
        <Controller
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <CheckboxRow checked={field.value} error={fieldState.error?.message} label={label} onChange={field.onChange} />
          )}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  cardContent: { gap: spacing.md },
});
