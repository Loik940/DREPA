// Onglet Profil : présente les informations du compte et la déconnexion.
// Il est utilisé par une personne authentifiée dont l'onboarding est terminé.
// Il affiche les données personnelles et de suivi enregistrées pour ce compte.
// Ses actions ouvrent l'édition du profil, les mentions légales ou quittent la session.
// Les accès restent liés à la session et les informations affichées ne valent pas avis médical.
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { PasswordField } from '@/components/ui/PasswordField';
import { Card } from '@/components/ui/Card';
import { useCurrentUserRoleQuery } from '@/features/moderation/queries';
import { ProfileContactSection } from '@/features/profile/components/ProfileContactSection';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard';
import { ProfileSettingsList } from '@/features/profile/components/ProfileSettingsList';
import { useProfileQuery } from '@/features/profile/queries';
import { useRevokeConsentMutation } from '@/features/profile/mutations';
import { cancelAllDrepaNotifications, resumeMedicationNotificationScheduling } from '@/features/medications/notifications';
import { reconcileMedicationNotifications } from '@/features/medications/reconciliation';
import { useAuth } from '@/providers/auth-provider';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const profileEditRoute = '/(app)/profile-edit' as Href;
const moderationRoute = '/(app)/admin/moderation' as Href;

export default function ProfileScreen() {
  // Les hooks préparent la navigation, la session, la suppression et le profil privé.
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const profileQuery = useProfileQuery(user?.id);
  const roleQuery = useCurrentUserRoleQuery(user?.id);
  const revokeConsent = useRevokeConsentMutation(user?.id ?? '');
  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteError(null);
  };

  const confirmConsentRevocation = () => {
    Alert.alert(
      'Retirer mes consentements ?',
      'L’accès aux fonctionnalités sera suspendu jusqu’à une nouvelle acceptation des informations en vigueur.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => void cancelAllDrepaNotifications()
            .then(() => revokeConsent.mutateAsync())
            .then(() => router.replace('/(app)/consent'))
            .catch(async () => {
              if (await resumeMedicationNotificationScheduling() && user?.id) {
                await reconcileMedicationNotifications(user.id).catch(() => undefined);
              }
              setDeleteError('Les consentements ne peuvent pas être retirés pour le moment.');
            }),
        },
      ],
    );
  };

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
        { text: 'Continuer', style: 'destructive', onPress: () => setDeleteModalVisible(true) },
      ],
    );
  };

  // L’appel serveur de suppression expose un état d’attente et une erreur sûre.
  const handleDelete = async () => {
    if (!deletePassword) {
      setDeleteError('Saisis ton mot de passe pour confirmer la suppression.');
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      setDeletePassword('');
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
      <ProfileSettingsList
        onConsent={confirmConsentRevocation}
        onLegal={() => router.push('/(auth)/legal')}
        onModeration={
          roleQuery.data === 'admin' ? () => router.push(moderationRoute) : undefined
        }
      />
      <Button label="Se déconnecter" variant="ghost" onPress={() => void signOut().catch(() => setDeleteError('La session locale a été fermée, mais le serveur n’a pas confirmé la déconnexion.'))} />
      {deleteError && <AppText accessibilityRole="alert" variant="caption" color="sos" align="center">{deleteError}</AppText>}
      <Button label="Supprimer mon compte" variant="danger" loading={isDeleting} onPress={confirmDelete} />
      <AppText variant="caption" color="textSecondary" align="center">La suppression est définitive et passe par une opération serveur sécurisée.</AppText>
      <Modal animationType="fade" onRequestClose={closeDeleteModal} transparent visible={deleteModalVisible}>
        <KeyboardAvoidingView behavior="height" style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled" style={styles.modalScrollView}>
            <Card accessibilityViewIsModal style={styles.modalCard}>
              <AppText variant="sectionTitle">Confirmer ton identité</AppText>
              <AppText color="textSecondary">Saisis ton mot de passe. La session sera revérifiée avant toute suppression.</AppText>
              <PasswordField label="Mot de passe" value={deletePassword} onChangeText={setDeletePassword} />
              {deleteError ? <AppText accessibilityRole="alert" color="sos">{deleteError}</AppText> : null}
              <Button label="Supprimer définitivement" variant="danger" loading={isDeleting} onPress={() => void handleDelete()} />
              <Button label="Annuler" variant="ghost" onPress={closeDeleteModal} />
            </Card>
          </ScrollView>
          <Pressable accessibilityLabel="Fermer la confirmation" accessibilityRole="button" onPress={closeDeleteModal} style={StyleSheet.absoluteFill} />
        </KeyboardAvoidingView>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, paddingBottom: spacing.huge },
  header: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  modalOverlay: { alignItems: 'center', backgroundColor: colors.overlay, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  modalCard: { gap: spacing.lg, width: '100%', zIndex: 1 },
  modalScroll: { flexGrow: 1, justifyContent: 'center' },
  modalScrollView: { maxHeight: '90%', width: '100%', zIndex: 1 },
});
