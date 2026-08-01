import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { useUpsertProfileMutation } from '@/features/profile/mutations';
import { ProfileDataError, useProfileQuery } from '@/features/profile/queries';
import { profileSchema, type ProfileValues } from '@/features/profile/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

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
    return <LoadingState message="Chargement du profil..." />;
  }

  if (profileQuery.isError) {
    const error = profileQuery.error instanceof ProfileDataError
      ? profileQuery.error
      : new ProfileDataError('profiles', 'unknown', 'Le profil ne peut pas être chargé.');

    return <ErrorState description={error.message} onRetry={() => void profileQuery.refetch()} />;
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Compléter mon profil</AppText>
        <AppText color="textSecondary">Ces informations restent privées et servent à personnaliser ton espace.</AppText>
      </View>
      <View style={styles.form}>
        <ProfileInput control={control} name="first_name" label="Prénom ou pseudonyme" />
        <ProfileInput control={control} name="country" label="Pays" />
        <ProfileInput control={control} name="full_name" label="Nom complet (facultatif)" />
        <ProfileInput control={control} name="city" label="Ville (facultatif)" />
      </View>
      {formState.errors.root?.message && <AppText color="sos">{formState.errors.root.message}</AppText>}
      <Button label="Enregistrer le profil" loading={formState.isSubmitting || mutation.isPending} onPress={handleSubmit(onSubmit)} />
      <AppText variant="caption" color="textSecondary" align="center">Les informations médicales facultatives sont déclarées par toi et ne constituent pas un document médical officiel.</AppText>
    </ScreenContainer>
  );
}

function ProfileInput({ control, name, label }: { control: Control<ProfileValues>; name: FieldPath<ProfileValues>; label: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextFieldAdapter label={label} value={field.value ?? ''} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
      )}
    />
  );
}

function TextFieldAdapter({ label, value, onBlur, onChangeText, error }: { label: string; value: string; onBlur: () => void; onChangeText: (value: string) => void; error?: string }) {
  return <TextField label={label} value={value} onBlur={onBlur} onChangeText={onChangeText} error={error} />;
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  form: { gap: spacing.lg },
});
