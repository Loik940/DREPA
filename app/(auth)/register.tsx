import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PasswordField } from '@/components/ui/PasswordField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { signUpSchema, type SignUpValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/theme/use-app-theme';
import { spacing } from '@/theme/spacing';

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { colors } = useAppTheme();
  const { control, handleSubmit, setError, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', passwordConfirmation: '' },
  });

  const onSubmit = async (values: SignUpValues) => {
    try {
      const { session } = await auth.signUp(values.email, values.password);

      if (session) {
        router.replace('/');
      } else {
        setError('root', { message: 'Consulte ta messagerie pour confirmer ton adresse e-mail.' });
      }
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Inscription impossible.' });
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="label" color="brand" align="center">DRÉPA</AppText>
        <AppText variant="title" align="center">Créer mon compte</AppText>
        <AppText color="textSecondary" align="center">C’est gratuit et confidentiel.</AppText>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label="E-mail"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="ton@email.com"
              value={field.value}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordField
              label="Mot de passe"
              autoComplete="new-password"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Au moins 8 caractères"
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
              autoComplete="new-password"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Répète ton mot de passe"
              value={field.value}
              error={fieldState.error?.message}
            />
          )}
        />
        {formState.errors.root?.message && <AppText color="sos" align="center">{formState.errors.root.message}</AppText>}
        <Button label="Créer mon compte" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      </View>

      <View style={styles.footer}>
        <AppText color="textSecondary" align="center">Tu as déjà un compte ?</AppText>
        <Link href="/(auth)/login" style={[styles.link, { color: colors.brand }]}>Se connecter</Link>
        <AppText variant="caption" color="textSecondary" align="center">DRÉPA ne remplace pas un professionnel de santé.</AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', minHeight: '100%', paddingVertical: spacing.xxxl },
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxxl },
  form: { gap: spacing.lg },
  footer: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxxl },
  link: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
