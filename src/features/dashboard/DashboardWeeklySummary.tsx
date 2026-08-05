import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatDashboardAverage, type DashboardSummary } from './dashboard';

export function DashboardWeeklySummary({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) {
    return null;
  }

  const medicationSummary = summary.medicationTrackedCount
    ? `${summary.medicationTakenCount}/${summary.medicationTrackedCount}`
    : '—';

  return (
    <Card style={styles.card}>
      <AppText variant="sectionTitle">Cette semaine</AppText>
      <AppText variant="caption" color="textSecondary">Résumé des entrées enregistrées, sans interprétation médicale.</AppText>
      <View style={styles.stats}>
        <SummaryStat value={String(summary.trackedDays)} label="jours suivis" />
        <SummaryStat value={formatDashboardAverage(summary.averagePain)} label="douleur déclarée" />
        <SummaryStat value={medicationSummary} label="prises déclarées" />
      </View>
    </Card>
  );
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="sectionTitle" color="brand" align="center">{value}</AppText>
      <AppText variant="caption" color="textSecondary" align="center">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { backgroundColor: colors.backgroundMuted, borderRadius: 12, flex: 1, gap: spacing.xs, padding: spacing.md },
});
