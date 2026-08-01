import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
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
      <AppText variant="title">Mon profil</AppText>
      <Card>
        <View style={styles.cardContent}>
          <AppText variant="sectionTitle">{profileQuery.data.first_name ?? 'Profil'}</AppText>
          <AppText color="textSecondary">{profileQuery.data.country ?? 'Pays non renseigné'}</AppText>
          <AppText variant="caption" color="textSecondary">Les informations affichées sont celles de ton compte.</AppText>
        </View>
      </Card>
      <Button label="Se déconnecter" variant="ghost" onPress={() => void signOut()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl },
  cardContent: { gap: spacing.md },
});
