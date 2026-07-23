import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { updatePasswordSchema, type UpdatePasswordValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { control, handleSubmit, setError, formState } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  if (auth.status === 'loading') {
    return <Text style={styles.message}>Vérification du lien...</Text>;
  }

  if (!auth.isPasswordRecovery) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  const onSubmit = async ({ password }: UpdatePasswordValues) => {
    try {
      await auth.updatePassword(password);
      await auth.signOut();
      auth.clearPasswordRecovery();
      router.replace('/(auth)/login');
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Modification impossible.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau mot de passe</Text>
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              autoCapitalize="none"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Nouveau mot de passe"
              secureTextEntry
              style={styles.input}
              value={field.value}
            />
            {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
          </View>
        )}
      />
      <Controller
        control={control}
        name="passwordConfirmation"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              autoCapitalize="none"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              style={styles.input}
              value={field.value}
            />
            {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
          </View>
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
  input: { borderColor: '#A0A0A0', borderRadius: 8, borderWidth: 1, padding: 12 },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#B00020' },
  message: { flex: 1, padding: 24, textAlign: 'center' },
});
