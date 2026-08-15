// Écran de récupération : demande un lien de réinitialisation sans révéler l’existence d’un compte.
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { passwordResetRequestSchema, type PasswordResetRequestValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function ForgotPasswordScreen() {
  // Les hooks initialisent l’authentification, l’état d’envoi et le formulaire validé.
  const auth = useAuth();
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<PasswordResetRequestValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  });

  // Après validation, la demande de récupération est envoyée au serveur.
  const onSubmit = async ({ email }: PasswordResetRequestValues) => {
    try {
      await auth.requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Demande impossible.' });
    }
  };

  // Le rendu principal affiche le formulaire et la confirmation d’envoi.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Mot de passe oublié</AppText>
        <AppText color="textSecondary">Si un compte correspond à cette adresse, un lien sécurisé sera envoyé.</AppText>
      </View>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
              label="Adresse e-mail"
              autoCapitalize="none"
              autoComplete="email"
              error={fieldState.error?.message}
              keyboardType="email-address"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="nom@exemple.com"
              value={field.value}
            />
        )}
      />
      {formState.errors.root?.message && <StatusBanner message={formState.errors.root.message} tone="error" />}
      {sent && <StatusBanner message="Consulte ta messagerie pour continuer." tone="success" />}
      <Button disabled={sent} label={sent ? 'Lien envoyé' : 'Envoyer le lien'} loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      <Link asChild href="/(auth)/login">
        <Pressable accessibilityRole="link" style={styles.link}>
          <AppText variant="label" color="brand" align="center">Retour à la connexion</AppText>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, justifyContent: 'center', minHeight: '100%' },
  header: { gap: spacing.sm },
  link: { alignSelf: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.md },
});
