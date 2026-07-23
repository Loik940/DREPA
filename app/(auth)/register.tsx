import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm, type ControllerFieldState, type ControllerRenderProps, type FieldPath } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { signUpSchema, type SignUpValues } from '@/features/auth/schemas';
import { useAuth } from '@/providers/auth-provider';

export default function RegisterScreen() {
  const router = useRouter();
  const auth = useAuth();
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
        setError('root', { message: 'Consultez votre messagerie pour confirmer votre adresse e-mail.' });
      }
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'Inscription impossible.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => <Field field={field} fieldState={fieldState} placeholder="E-mail" keyboardType="email-address" />}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => <Field field={field} fieldState={fieldState} placeholder="Mot de passe" secureTextEntry />}
      />
      <Controller
        control={control}
        name="passwordConfirmation"
        render={({ field, fieldState }) => <Field field={field} fieldState={fieldState} placeholder="Confirmer le mot de passe" secureTextEntry />}
      />
      {formState.errors.root?.message && <Text style={styles.error}>{formState.errors.root.message}</Text>}
      <Pressable disabled={formState.isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.button}>
        <Text style={styles.buttonText}>{formState.isSubmitting ? 'Création...' : 'Créer le compte'}</Text>
      </Pressable>
      <Link href="/(auth)/login" style={styles.link}>Retour à la connexion</Link>
    </View>
  );
}

function Field({
  field,
  fieldState,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  field: ControllerRenderProps<SignUpValues, FieldPath<SignUpValues>>;
  fieldState: ControllerFieldState;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
}) {
  return (
    <View>
      <TextInput
        autoCapitalize="none"
        keyboardType={keyboardType}
        onBlur={field.onBlur}
        onChangeText={field.onChange}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={field.value}
      />
      {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
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
