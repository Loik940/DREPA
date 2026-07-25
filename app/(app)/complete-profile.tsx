import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { profileSchema, type ProfileValues } from '@/features/profile/schemas';
import { useUpsertProfileMutation } from '@/features/profile/mutations';
import { ProfileDataError, useProfileQuery } from '@/features/profile/queries';
import { useAuth } from '@/providers/auth-provider';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const mutation = useUpsertProfileMutation(user?.id ?? '');
  const { control, handleSubmit, reset, setError, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', country: '', full_name: '', city: '' },
  });

  useEffect(() => {
    if (profileQuery.data) {
      reset({
        first_name: profileQuery.data.first_name ?? '',
        country: profileQuery.data.country ?? '',
        full_name: profileQuery.data.full_name ?? '',
        date_of_birth: profileQuery.data.date_of_birth ?? '',
        drepanocytosis_type: profileQuery.data.drepanocytosis_type ?? '',
        city: profileQuery.data.city ?? '',
        blood_group: profileQuery.data.blood_group ?? '',
        allergies: profileQuery.data.allergies ?? '',
        care_center: profileQuery.data.care_center ?? '',
        doctor_name: profileQuery.data.doctor_name ?? '',
        doctor_phone: profileQuery.data.doctor_phone ?? '',
      });
    }
  }, [profileQuery.data, reset]);

  const onSubmit = async (values: ProfileValues) => {
    if (!user?.id) {
      setError('root', { message: 'La session utilisateur est indisponible.' });
      return;
    }

    try {
      await mutation.mutateAsync(values);
      router.replace('/(app)/(tabs)');
    } catch {
      setError('root', { message: 'Le profil ne peut pas être enregistré.' });
    }
  };

  if (profileQuery.isPending) {
    return <Text style={styles.message}>Chargement du profil...</Text>;
  }

  if (profileQuery.isError) {
    const error = profileQuery.error instanceof ProfileDataError
      ? profileQuery.error
      : new ProfileDataError('unknown', 'Le profil ne peut pas être chargé.');

    return (
      <View style={styles.messageContainer}>
        <Text style={styles.title}>Profil indisponible</Text>
        <Text style={styles.message}>{error.message}</Text>
        <Pressable onPress={() => void profileQuery.refetch()} style={styles.button}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Compléter le profil</Text>
      <Text>{"Les informations médicales facultatives ne bloquent pas l'utilisation de l'application."}</Text>
      <ProfileInput control={control} name="first_name" label="Prénom ou pseudonyme" />
      <ProfileInput control={control} name="country" label="Pays" />
      <ProfileInput control={control} name="full_name" label="Nom complet (facultatif)" />
      <ProfileInput control={control} name="city" label="Ville (facultatif)" />
      {formState.errors.root?.message && <Text style={styles.error}>{formState.errors.root.message}</Text>}
      <Pressable disabled={formState.isSubmitting || mutation.isPending} onPress={handleSubmit(onSubmit)} style={styles.button}>
        <Text style={styles.buttonText}>{mutation.isPending ? 'Enregistrement...' : 'Enregistrer le profil'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileInput({ control, name, label }: { control: Control<ProfileValues>; name: FieldPath<ProfileValues>; label: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={styles.field}>
          <Text>{label}</Text>
          <TextInput onBlur={field.onBlur} onChangeText={field.onChange} style={styles.input} value={field.value ?? ''} />
          {fieldState.error && <Text style={styles.error}>{fieldState.error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  field: { gap: 6 },
  input: { borderColor: '#A0A0A0', borderRadius: 8, borderWidth: 1, padding: 12 },
  button: { alignItems: 'center', backgroundColor: '#208AEF', borderRadius: 8, padding: 14 },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#B00020' },
  message: { flex: 1, padding: 24, textAlign: 'center' },
  messageContainer: { flex: 1, gap: 14, justifyContent: 'center', padding: 24 },
});
