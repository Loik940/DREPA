// Carte compacte d’un rappel du jour avec statut calculé et confirmation de prise déclarée.
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import type { TodayReminder } from '../status';

const labels = { late: 'EN RETARD', pending: 'EN ATTENTE', taken: 'PRIS', snoozed: 'REPORTÉ', skipped: 'IGNORÉ' } as const;

// Composant de rappel : le statut affiché vient des horaires et déclarations, sans confirmer la prise du traitement.
export function ReminderCard({ item, onTaken, loading }: { item: TodayReminder; onTaken: () => void; loading: boolean }) {
  const palette = item.status === 'late'
    ? { color: colors.sos, background: colors.errorSoft, icon: 'alarm' as const }
    : item.status === 'taken'
      ? { color: colors.success, background: colors.successSoft, icon: 'check_circle' as const }
      : { color: colors.warning, background: colors.warningSoft, icon: 'hourglass_top' as const };
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.scheduledAt));

  return (
    <Card style={[styles.card, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: palette.color }]}>
          <SymbolView name={{ android: palette.icon }} size={24} tintColor={colors.onSos} />
        </View>
        <View style={[styles.badge, { borderColor: palette.color }]}>
          <AppText variant="caption" color={item.status === 'taken' ? 'success' : item.status === 'late' ? 'sos' : 'warning'}>{labels[item.status]}</AppText>
        </View>
      </View>
      <AppText variant="label">{item.medication.name}</AppText>
      <AppText color="textSecondary">{time}</AppText>
      {item.status !== 'taken' && (
        <Pressable accessibilityRole="button" disabled={loading} onPress={onTaken} style={styles.takenButton}>
          <AppText variant="caption" color="success">Marquer comme pris</AppText>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, minHeight: 194, width: 258 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  icon: { alignItems: 'center', borderRadius: radii.md, height: 56, justifyContent: 'center', width: 56 },
  badge: { borderRadius: radii.full, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  takenButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
});
