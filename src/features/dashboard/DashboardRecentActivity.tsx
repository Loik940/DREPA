// Carte de dernière activité : affiche uniquement l’entrée de journal réellement disponible.
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { DashboardEntry } from './dashboard';

export function DashboardRecentActivity({ entry }: { entry: DashboardEntry | null }) {
  const router = useRouter();
  // L’état vide est explicite et ne présente aucune activité fictive.
  if (!entry) {
    return (
      <Card style={styles.card}>
        <AppText variant="sectionTitle">Dernière activité</AppText>
        <View style={styles.row}>
          <View style={[styles.marker, styles.emptyMarker]} />
          <View style={styles.content}>
            <AppText variant="label">Aucune entrée récente</AppText>
            <AppText color="textSecondary">Ton prochain enregistrement apparaîtra ici.</AppText>
          </View>
        </View>
      </Card>
    );
  }

  const recordedAt = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(entry.recorded_at));

  return (
    <Pressable
      accessibilityHint="Ouvre cette entrée du journal"
      accessibilityLabel={`Dernière entrée du journal, enregistrée le ${recordedAt}${entry.pain_level === null ? '' : `, douleur déclarée ${entry.pain_level} sur 10`}`}
      accessibilityRole="button"
      onPress={() => router.push(`/(app)/health-log/${entry.id}` as Href)}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
    >
      <Card style={styles.card}>
      <AppText variant="sectionTitle">Dernière activité</AppText>
      <View style={styles.row}>
        <View style={styles.marker} />
        <View style={styles.content}>
          <AppText variant="label">Entrée du journal</AppText>
          <AppText variant="caption" color="textSecondary">Enregistrée le {recordedAt}</AppText>
          {/* La douleur est une valeur déclarée ; son absence reste masquée sans interprétation. */}
          {entry.pain_level !== null && (
            <AppText variant="caption" color="textSecondary">Douleur déclarée : {entry.pain_level}/10</AppText>
          )}
        </View>
      </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  marker: { backgroundColor: colors.brand, borderRadius: 999, height: 12, marginTop: 4, width: 12 },
  emptyMarker: { backgroundColor: colors.backgroundMuted, borderColor: colors.border, borderWidth: 1 },
  content: { flex: 1, gap: spacing.xs },
});
