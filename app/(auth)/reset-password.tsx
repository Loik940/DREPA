// Écran de réinitialisation : valide et enregistre un nouveau mot de passe après un lien sécurisé.
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PasswordField } from '@/components/ui/PasswordField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { updatePasswordSchema, type UpdatePasswordValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function ResetPasswordScreen() {
  // Les hooks initialisent la navigation, l’authentification et le formulaire validé.
  const router = useRouter();
  const auth = useAuth();
  const { control, handleSubmit, setError, formState } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  // Le lien sécurisé doit être vérifié avant d’afficher le formulaire.
  if (auth.status === 'loading') {
    return <ScreenContainer style={styles.message}><AppText color="textSecondary" align="center">Vérification du lien...</AppText></ScreenContainer>;
  }

  // Un lien invalide ou absent renvoie vers la demande de récupération.
  if (!auth.isPasswordRecovery) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  // Après validation, le serveur met à jour le mot de passe puis ferme la session.
  const onSubmit = async ({ password }: UpdatePasswordValues) => {
    try {
      await auth.updatePassword(password);
      await auth.signOut();
      auth.clearPasswordRecovery();
      // Une modification réussie ramène vers la connexion.
      router.replace('/(auth)/login');
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Modification impossible.' });
    }
  };

  // Le rendu principal affiche les champs et les erreurs de validation.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Nouveau mot de passe</AppText>
        <AppText color="textSecondary">Choisis au moins 8 caractères avec une majuscule, une minuscule et un chiffre.</AppText>
      </View>
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PasswordField
            label="Nouveau mot de passe"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="passwordConfirmation"
        render={({ field, fieldState }) => (
          <PasswordField
            label="Confirmer le mot de passe"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            value={field.value}
            error={fieldState.error?.message}
          />
        )}
      />
      {formState.errors.root?.message && <StatusBanner message={formState.errors.root.message} tone="error" />}
      <Button label="Modifier le mot de passe" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, justifyContent: 'center', minHeight: '100%' },
  header: { gap: spacing.sm },
  message: { alignItems: 'center', justifyContent: 'center' },
});
