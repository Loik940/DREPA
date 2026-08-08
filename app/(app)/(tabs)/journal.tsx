// Onglet Journal : liste les entrées privées et ouvre la création ou le détail.
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useHealthLogsQuery, type HealthLog } from '@/features/health-log/queries';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function JournalScreen() {
  // Les hooks préparent la navigation, l’utilisateur et la liste paginée privée.
  const router = useRouter();
  const { user } = useAuth();
  const query = useHealthLogsQuery(user?.id);
  const entries = query.data?.pages.flat() ?? [];

  // Le chargement, l’erreur et le journal vide ont chacun un rendu dédié.
  if (query.isPending) {
    return <LoadingState message="Chargement du journal..." />;
  }

  if (query.isError) {
    return <ErrorState description={query.error.message} onRetry={() => void query.refetch()} />;
  }

  if (!entries.length) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Ton journal est vide"
          description="Chaque entrée peut t’aider à garder une trace personnelle de ton quotidien."
          actionLabel="Enregistrer mon état"
          onAction={() => router.push('/(app)/health-entry')}
        />
      </ScreenContainer>
    );
  }

  // Le rendu principal affiche les entrées et les actions de navigation.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="title">Mon journal</AppText>
          <AppText color="textSecondary">Tes entrées personnelles les plus récentes.</AppText>
        </View>
        <View style={styles.headerActions}>
          <Button label="Statistiques" variant="secondary" onPress={() => router.push('/(app)/health-statistics')} />
          <Button label="Ajouter" onPress={() => router.push('/(app)/health-entry')} />
        </View>
      </View>

      <View style={styles.list}>
        {entries.map((entry) => (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir cette entrée du journal"
            onPress={() => router.push({ pathname: '/(app)/health-log/[id]', params: { id: entry.id } })}
          >
            <HealthLogCard entry={entry} />
          </Pressable>
        ))}
      </View>

      {query.hasNextPage && (
        <Button
          label="Charger plus"
          variant="secondary"
          loading={query.isFetchingNextPage}
          onPress={() => void query.fetchNextPage()}
        />
      )}

      <AppText variant="caption" color="textSecondary" align="center">Ce journal est un suivi personnel et ne constitue pas un diagnostic.</AppText>
    </ScreenContainer>
  );
}

function HealthLogCard({ entry }: { entry: HealthLog }) {
  const recordedAt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(entry.recorded_at));
  const symptomCount = entry.symptoms?.length ?? 0;

  return (
    <Card>
      <View style={styles.cardContent}>
        <AppText variant="label" color="brand">{recordedAt}</AppText>
        <View style={styles.summary}>
          <AppText>Douleur : {entry.pain_level ?? 'non renseignée'}</AppText>
          <AppText>Fatigue : {entry.fatigue_level ?? 'non renseignée'}</AppText>
        </View>
        <AppText color="textSecondary">{symptomCount ? `${symptomCount} symptôme${symptomCount > 1 ? 's' : ''} déclaré${symptomCount > 1 ? 's' : ''}` : 'Aucun symptôme renseigné'}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, paddingBottom: spacing.huge },
  header: { alignItems: 'flex-start', gap: spacing.lg },
  headerCopy: { gap: spacing.sm },
  headerActions: { alignSelf: 'stretch', gap: spacing.sm },
  list: { gap: spacing.md },
  cardContent: { gap: spacing.md },
  summary: { gap: spacing.xs },
});
