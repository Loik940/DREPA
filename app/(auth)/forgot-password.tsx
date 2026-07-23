import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { passwordResetRequestSchema, type PasswordResetRequestValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';

export default function ForgotPasswordScreen() {
  const auth = useAuth();
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, setError, formState } = useForm<PasswordResetRequestValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }: PasswordResetRequestValues) => {
    try {
      await auth.requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Demande impossible.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      <Text>Si un compte correspond à cette adresse, un lien sera envoyé.</Text>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <View>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="E-mail"
              style={styles.input}
              value={field.value}
            />
            {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
          </View>
        )}
      />
      {formState.errors.root?.message && <Text style={styles.error}>{formState.errors.root.message}</Text>}
      {sent && <Text>Consultez votre messagerie pour continuer.</Text>}
      <Pressable disabled={formState.isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.button}>
        <Text style={styles.buttonText}>{formState.isSubmitting ? 'Envoi...' : 'Envoyer le lien'}</Text>
      </Pressable>
      <Link href="/(auth)/login" style={styles.link}>Retour à la connexion</Link>
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
  link: { color: '#1769AA', textAlign: 'center' },
});
