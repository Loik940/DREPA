// Écran de réinitialisation : valide et enregistre un nouveau mot de passe après un lien sécurisé.
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PasswordField } from '@/components/ui/PasswordField';
import { updatePasswordSchema, type UpdatePasswordValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';

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
    return <Text style={styles.message}>Vérification du lien...</Text>;
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
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau mot de passe</Text>
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
      {formState.errors.root?.message && <Text style={styles.error}>{formState.errors.root.message}</Text>}
      <Pressable disabled={formState.isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.button}>
        <Text style={styles.buttonText}>{formState.isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#B00020' },
  message: { flex: 1, padding: 24, textAlign: 'center' },
});
