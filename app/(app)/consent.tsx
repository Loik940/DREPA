import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { legalVersions } from '@/constants/legal-versions';
import { consentSchema, type ConsentValues } from '@/features/profile/schemas';
import { useAcceptConsentMutation } from '@/features/profile/mutations';
import { useAuth } from '@/providers/auth-provider';

export default function ConsentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mutation = useAcceptConsentMutation(user?.id ?? '');
  const { control, handleSubmit, setError, formState } = useForm<ConsentValues>({
    resolver: zodResolver(consentSchema),
    defaultValues: { termsAccepted: false, privacyAccepted: false, communityAccepted: false },
  });

  const onSubmit = async (values: ConsentValues) => {
    if (!user?.id) {
      setError('root', { message: 'La session utilisateur est indisponible.' });
      return;
    }

    try {
      await mutation.mutateAsync(values);
      router.replace('/(app)/complete-profile');
    } catch {
      setError('root', { message: 'Les consentements ne peuvent pas être enregistrés.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consentements</Text>
      <Text>Versions courantes : {legalVersions.terms}, {legalVersions.privacy}, {legalVersions.communityGuidelines}.</Text>
      <ConsentCheckbox control={control} name="termsAccepted" label="J'accepte les conditions générales d'utilisation." />
      <ConsentCheckbox control={control} name="privacyAccepted" label="J'accepte la politique de confidentialité." />
      <ConsentCheckbox control={control} name="communityAccepted" label="J'accepte la charte communautaire." />
      {formState.errors.root?.message && <Text style={styles.error}>{formState.errors.root.message}</Text>}
      <Pressable disabled={formState.isSubmitting || mutation.isPending} onPress={handleSubmit(onSubmit)} style={styles.button}>
        <Text style={styles.buttonText}>{mutation.isPending ? 'Enregistrement...' : 'Continuer'}</Text>
      </Pressable>
    </View>
  );
}

function ConsentCheckbox({
  control,
  name,
  label,
}: {
  control: Control<ConsentValues>;
  name: FieldPath<ConsentValues>;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View>
          <Pressable onPress={() => field.onChange(!field.value)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, field.value && styles.checkboxSelected]} />
            <Text style={styles.checkboxLabel}>{label}</Text>
          </Pressable>
          {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  checkboxRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  checkbox: { borderColor: '#777777', borderRadius: 4, borderWidth: 1, height: 24, width: 24 },
  checkboxSelected: { backgroundColor: '#208AEF' },
  checkboxLabel: { flex: 1 },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#B00020' },
});
