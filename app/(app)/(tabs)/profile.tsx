import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const profileQuery = useProfileQuery(user?.id);

  if (profileQuery.isPending) {
    return <LoadingState message="Chargement du profil..." />;
  }

  if (profileQuery.isError) {
    return <ErrorState description="Ton profil ne peut pas être chargé pour le moment." onRetry={() => void profileQuery.refetch()} />;
  }

  if (!profileQuery.data) {
    return <EmptyState title="Profil incomplet" description="Complète ton profil pour retrouver ici tes informations personnelles." actionLabel="Compléter le profil" onAction={() => router.push('/(app)/complete-profile')} />;
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Mon profil</AppText>
        <Button label="Modifier" variant="secondary" onPress={() => router.push('/(app)/complete-profile')} />
      </View>
      <ProfileHeader profile={profileQuery.data} />
      <ProfileInfoCard profile={profileQuery.data} />
      <ProfileContactSection />
      <ProfileSettingsList onLegal={() => router.push('/(auth)/legal')} />
      <Button label="Se déconnecter" variant="ghost" onPress={() => void signOut()} />
      <AppText variant="caption" color="textSecondary" align="center">La suppression sécurisée du compte sera disponible avec l’opération serveur dédiée.</AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, paddingBottom: spacing.huge },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
