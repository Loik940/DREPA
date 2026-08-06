// Écran de connexion : collecte les identifiants et redirige après confirmation de session.
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PasswordField } from '@/components/ui/PasswordField';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { signInSchema, type SignInValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/theme/use-app-theme';
import { spacing } from '@/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { colors } = useAppTheme();
  const { control, handleSubmit, setError, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInValues) => {
    auth.clearError();

    try {
      await auth.signIn(values.email, values.password);
      router.replace('/');
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Connexion impossible.' });
    }
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="label" color="brand" align="center">DRÉPA</AppText>
        <AppText variant="title" align="center">Connexion</AppText>
        <AppText color="textSecondary" align="center">Bon retour parmi nous.</AppText>
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
              autoComplete="password"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Saisis ton mot de passe"
              value={field.value}
              error={fieldState.error?.message}
            />
          )}
        />
        <Link href="/(auth)/forgot-password" style={[styles.link, { color: colors.brand }]}>Mot de passe oublié ?</Link>
        {formState.errors.root?.message && <AppText color="sos" align="center">{formState.errors.root.message}</AppText>}
        <Button label="Se connecter" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      </View>

      <View style={styles.footer}>
        <AppText color="textSecondary" align="center">Tu n’as pas encore de compte ?</AppText>
        <Link href="/(auth)/register" style={[styles.link, { color: colors.brand }]}>Créer un compte</Link>
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
