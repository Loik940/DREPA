import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { getChoiceLabel, symptomChoices, triggerChoices } from '@/features/health-log/options';
import { useHealthLogStatisticsSourceQuery } from '@/features/health-log/queries';
import { calculateHealthLogStatistics } from '@/features/health-log/statistics';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export default function HealthStatisticsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const query = useHealthLogStatisticsSourceQuery(user?.id, 30);

  if (query.isPending) return <LoadingState message="Calcul des statistiques..." />;
  if (query.isError) return <ErrorState description={query.error.message} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <EmptyState title="Pas encore de statistiques" description="Ajoute des entrées au journal pour obtenir un résumé descriptif." />;

  const statistics = calculateHealthLogStatistics(query.data);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Mes statistiques</AppText>
        <AppText color="textSecondary">Résumé des 30 derniers jours.</AppText>
      </View>

      <StatusBanner message="Ces statistiques décrivent uniquement les informations que tu as enregistrées. Elles ne constituent pas un diagnostic." />

      <View style={styles.grid}>
        <StatisticCard label="Entrées" value={statistics.entryCount.toString()} />
        <StatisticCard label="Jours suivis" value={statistics.trackedDays.toString()} />
        <StatisticCard label="Douleur moyenne" value={statistics.averagePain === null ? '—' : `${statistics.averagePain} / 10`} />
        <StatisticCard label="Fatigue moyenne" value={statistics.averageFatigue === null ? '—' : `${statistics.averageFatigue} / 10`} />
      </View>

      <Card>
        <View style={styles.section}>
          <AppText variant="sectionTitle">Prises déclarées</AppText>
          <AppText>{statistics.medicationTrackedCount ? `${statistics.medicationTakenCount} oui sur ${statistics.medicationTrackedCount} réponses` : 'Aucune prise renseignée.'}</AppText>
        </View>
      </Card>

      <FrequencyCard title="Symptômes les plus renseignés" values={statistics.topSymptoms} labels={symptomChoices} color={colors.brand} />
      <FrequencyCard title="Facteurs les plus renseignés" values={statistics.topTriggers} labels={triggerChoices} color={colors.actionBg} />
    </ScreenContainer>
  );
}

function StatisticCard({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.statCard}>
      <AppText variant="sectionTitle" color="brand">{value}</AppText>
      <AppText variant="caption" color="textSecondary">{label}</AppText>
    </Card>
  );
}

function FrequencyCard({ title, values, labels, color }: { title: string; values: { value: string; count: number }[]; labels: readonly { label: string; value: string }[]; color: string }) {
  const max = Math.max(...values.map((item) => item.count), 1);

  return (
    <Card>
      <View style={styles.section}>
        <AppText variant="sectionTitle">{title}</AppText>
        {values.length ? values.map((item) => (
          <View key={item.value} style={styles.frequency}>
            <View style={styles.frequencyHeader}>
              <AppText>{getChoiceLabel(labels, item.value)}</AppText>
              <AppText variant="label">{item.count}</AppText>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { backgroundColor: color, width: `${Math.max((item.count / max) * 100, 8)}%` }]} />
            </View>
          </View>
        )) : <AppText color="textSecondary">Aucune information renseignée.</AppText>}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { flexBasis: '47%', flexGrow: 1, minWidth: 140 },
  section: { gap: spacing.md },
  frequency: { gap: spacing.sm },
  frequencyHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { backgroundColor: '#E8D5C4', borderRadius: radii.full, height: 8, overflow: 'hidden' },
  fill: { borderRadius: radii.full, height: '100%' },
});
