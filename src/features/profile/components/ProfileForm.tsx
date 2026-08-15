// Ce composant partage le formulaire de profil entre l'onboarding et l'édition.
// Il reçoit les textes de l'écran et l'action à exécuter après une sauvegarde réussie.
// Il charge et préremplit uniquement les données du profil de la session authentifiée.
// La validation et l'enregistrement réutilisent les règles sécurisées déjà en place.
// Les informations de suivi restent déclaratives et ne constituent pas un avis médical.
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type ComponentProps } from 'react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { TextField } from '@/components/ui/TextField';
import { DatePickerField } from '@/features/medications/components/DatePickerField';
import { formatLocalDate } from '@/features/medications/date-time';
import { useUpsertProfileMutation } from '@/features/profile/mutations';
import { ProfileDataError, useProfileQuery } from '@/features/profile/queries';
import { profileSchema, type ProfileValues } from '@/features/profile/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

type ProfileFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  onSaved: () => void;
};

const defaultValues: ProfileValues = {
  first_name: '',
  country: '',
  full_name: '',
  city: '',
  date_of_birth: '',
  drepanocytosis_type: '',
  blood_group: '',
  allergies: '',
  care_center: '',
  doctor_name: '',
  doctor_phone: '',
};

export function ProfileForm({ title, description, submitLabel, onSaved }: ProfileFormProps) {
  const { user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const mutation = useUpsertProfileMutation(user?.id ?? '');
  // Le résolveur Zod applique les mêmes limites au parcours d'onboarding et à l'édition du profil.
  const { control, handleSubmit, reset, setError, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  // Le formulaire est prérempli uniquement avec le profil chargé pour la session authentifiée.
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
    // Aucune mutation n'est lancée sans identifiant provenant de la session courante.
    if (!user?.id) {
      setError('root', { message: 'La session utilisateur est indisponible.' });
      return;
    }

    try {
      await mutation.mutateAsync(values);
      onSaved();
    } catch {
      setError('root', { message: 'Le profil ne peut pas être enregistré.' });
    }
  };

  // Les états de chargement et d'erreur remplacent le formulaire tant que les données privées ne sont pas prêtes.
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
        <AppText variant="title">{title}</AppText>
        <AppText color="textSecondary">{description}</AppText>
      </View>
      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Identité</AppText>
          <ProfileInput control={control} name="first_name" label="Prénom ou pseudonyme" />
          <ProfileInput control={control} name="full_name" label="Nom complet (facultatif)" />
          <ProfileInput control={control} name="country" label="Pays" />
          <ProfileInput control={control} name="city" label="Ville (facultatif)" />
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field, fieldState }) => (
              <DatePickerField
                allowClear
                error={fieldState.error?.message}
                label="Date de naissance (facultatif)"
                maximumDate={formatLocalDate(new Date())}
                onChange={field.onChange}
                value={field.value ?? ''}
              />
            )}
          />
        </View>
      </Card>
      <Card>
        {/* Ces champs restent déclaratifs : le formulaire ne valide ni diagnostic, ni traitement, ni urgence. */}
        <View style={styles.section}>
          <AppText variant="sectionTitle">Informations de suivi</AppText>
          <ProfileInput control={control} name="drepanocytosis_type" label="Type de drépanocytose (facultatif)" />
          <ProfileInput control={control} name="blood_group" label="Groupe sanguin (facultatif)" helperText="Déclaré par toi, non validé médicalement." />
          <ProfileInput control={control} name="allergies" label="Allergies connues (facultatif)" multiline />
          <ProfileInput control={control} name="care_center" label="Centre de suivi (facultatif)" />
          <ProfileInput control={control} name="doctor_name" label="Médecin référent (facultatif)" />
          <ProfileInput control={control} name="doctor_phone" label="Téléphone du médecin (facultatif)" keyboardType="phone-pad" />
        </View>
      </Card>
      {/* L'erreur de sauvegarde n'est affichée que lorsqu'un message neutre a été produit par le formulaire. */}
      {formState.errors.root?.message && <AppText accessibilityRole="alert" color="sos">{formState.errors.root.message}</AppText>}
      <Button label={submitLabel} loading={formState.isSubmitting || mutation.isPending} onPress={handleSubmit(onSubmit)} />
      <AppText variant="caption" color="textSecondary" align="center">Les informations médicales facultatives sont déclarées par toi et ne constituent pas un document médical officiel.</AppText>
    </ScreenContainer>
  );
}

function ProfileInput({
  control,
  name,
  label,
  helperText,
  keyboardType,
  multiline,
  placeholder,
}: {
  control: Control<ProfileValues>;
  name: FieldPath<ProfileValues>;
  label: string;
  helperText?: string;
  keyboardType?: ComponentProps<typeof TextField>['keyboardType'];
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          value={field.value ?? ''}
          onBlur={field.onBlur}
          onChangeText={field.onChange}
          error={fieldState.error?.message}
          helperText={helperText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : undefined}
          placeholder={placeholder}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  section: { gap: spacing.lg },
});
