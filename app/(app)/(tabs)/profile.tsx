// Onglet Profil : présente les informations du compte et la déconnexion.
// Il est utilisé par une personne authentifiée dont l'onboarding est terminé.
// Il affiche les données personnelles et de suivi enregistrées pour ce compte.
// Ses actions ouvrent l'édition du profil, les mentions légales ou quittent la session.
// Les accès restent liés à la session et les informations affichées ne valent pas avis médical.
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ProfileContactSection } from '@/features/profile/components/ProfileContactSection';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';
import { ProfileSettingsList } from '@/features/profile/components/ProfileSettingsList';
import { useProfileQuery } from '@/features/profile/queries';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const profileEditRoute = '/(app)/profile-edit' as Href;

export default function ProfileScreen() {
  // Les hooks préparent la navigation, la session, la suppression et le profil privé.
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const profileQuery = useProfileQuery(user?.id);

  // Le chargement, l’erreur et le profil absent ont chacun un rendu dédié.
  if (profileQuery.isPending) {
    return <LoadingState message="Chargement du profil..." />;
  }

  if (profileQuery.isError) {
    return <ErrorState description="Ton profil ne peut pas être chargé pour le moment." onRetry={() => void profileQuery.refetch()} />;
  }

  if (!profileQuery.data) {
    return <EmptyState title="Profil incomplet" description="Complète ton profil pour retrouver ici tes informations personnelles." actionLabel="Compléter le profil" onAction={() => router.push('/(app)/complete-profile')} />;
  }

  // La suppression définitive exige une confirmation destructive explicite.
  const confirmDelete = () => {
    Alert.alert(
      'Supprimer ton compte ?',
      'Cette action est définitive et supprimera tes données associées.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => void handleDelete() },
      ],
    );
  };

  // L’appel serveur de suppression expose un état d’attente et une erreur sûre.
  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteAccount();
    } catch {
      setDeleteError('Le compte ne peut pas être supprimé pour le moment.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Le rendu principal affiche les informations privées et les actions du compte.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Mon profil</AppText>
        <Button label="Modifier" variant="secondary" onPress={() => router.push(profileEditRoute)} />
      </View>
      <ProfileHeader profile={profileQuery.data} />
      <ProfileInfoCard profile={profileQuery.data} />
      <ProfileContactSection />
      <ProfileSettingsList onLegal={() => router.push('/(auth)/legal')} />
      <Button label="Se déconnecter" variant="ghost" onPress={() => void signOut()} />
      {deleteError && <AppText variant="caption" color="sos" align="center">{deleteError}</AppText>}
      <Button label="Supprimer mon compte" variant="danger" loading={isDeleting} onPress={confirmDelete} />
      <AppText variant="caption" color="textSecondary" align="center">La suppression est définitive et passe par une opération serveur sécurisée.</AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, paddingBottom: spacing.huge },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
