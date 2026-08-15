// Résumé descriptif des entrées récentes du Journal, sans interprétation médicale.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatDashboardAverage, type DashboardSummary } from './dashboard';

export function DashboardWeeklySummary({ summary }: { summary: DashboardSummary | null }) {
  // L’état vide garde la structure de l’accueil sans inventer de statistique.
  if (!summary) {
    return (
      <Card style={styles.card}>
        <View style={styles.headingRow}>
          <AppText variant="sectionTitle">Cette semaine</AppText>
          <View style={styles.badge}>
            <AppText variant="caption" color="brand">7 JOURS</AppText>
          </View>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.emptyTrack}>
          {Array.from({ length: 7 }, (_, index) => <View key={index} style={styles.emptyDay} />)}
        </View>
        <AppText variant="label">Ton résumé se construit avec toi</AppText>
        <AppText color="textSecondary">Les tendances descriptives apparaîtront après tes premières entrées du journal.</AppText>
      </Card>
    );
  }

  // Le ratio décrit uniquement les prises déclarées et ne confirme pas qu'un traitement a été suivi.
  const medicationSummary = summary.medicationTrackedCount
    ? `${summary.medicationTakenCount}/${summary.medicationTrackedCount}`
    : '—';

  return (
    <Card style={styles.card}>
      <View style={styles.headingRow}>
        <AppText variant="sectionTitle">Cette semaine</AppText>
        <View style={styles.badge}>
          <AppText variant="caption" color="brand">7 JOURS</AppText>
        </View>
      </View>
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
  headingRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  badge: { backgroundColor: colors.backgroundMuted, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  emptyTrack: { flexDirection: 'row', gap: spacing.sm },
  emptyDay: { backgroundColor: colors.backgroundMuted, borderColor: colors.border, borderRadius: 999, borderWidth: 1, flex: 1, height: 10 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { backgroundColor: colors.backgroundMuted, borderRadius: 12, flexBasis: '30%', flexGrow: 1, gap: spacing.xs, minWidth: 88, padding: spacing.md },
});
