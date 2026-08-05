import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { DashboardEntry } from './dashboard';

export function DashboardRecentActivity({ entry }: { entry: DashboardEntry | null }) {
  if (!entry) {
    return null;
  }

  const recordedAt = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(entry.recorded_at));

  return (
    <Card style={styles.card}>
      <AppText variant="sectionTitle">Dernière activité</AppText>
      <View style={styles.row}>
        <View style={styles.marker} />
        <View style={styles.content}>
          <AppText variant="label">Entrée du journal</AppText>
          <AppText variant="caption" color="textSecondary">Enregistrée le {recordedAt}</AppText>
          {entry.pain_level !== null && (
            <AppText variant="caption" color="textSecondary">Douleur déclarée : {entry.pain_level}/10</AppText>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  marker: { backgroundColor: colors.brand, borderRadius: 999, height: 12, marginTop: 4, width: 12 },
  content: { flex: 1, gap: spacing.xs },
});
