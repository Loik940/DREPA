// Carte compacte d’un rappel du jour avec statut calculé et actions déclaratives.
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import type { TodayReminder } from '../status';

const labels = { late: 'EN RETARD', pending: 'EN ATTENTE', taken: 'PRIS', snoozed: 'REPORTÉ', skipped: 'IGNORÉ' } as const;

type ReminderCardProps = {
  item: TodayReminder;
  onTaken: () => void;
  onSnooze: () => void;
  onSkipped: () => void;
  loading: boolean;
};

// Composant de rappel : chaque action enregistre uniquement la déclaration choisie par l’utilisateur.
export function ReminderCard({ item, onTaken, onSnooze, onSkipped, loading }: ReminderCardProps) {
  const palette = item.status === 'late'
    ? { color: colors.sos, background: colors.errorSoft, icon: 'alarm' as const }
    : item.status === 'taken'
      ? { color: colors.success, background: colors.successSoft, icon: 'check_circle' as const }
      : item.status === 'skipped'
        ? { color: colors.textSecondary, background: colors.backgroundMuted, icon: 'block' as const }
        : { color: colors.warning, background: colors.warningSoft, icon: 'hourglass_top' as const };
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.scheduledAt));
  const actionable = item.status === 'pending' || item.status === 'late' || item.status === 'snoozed';

  return (
    <Card style={[styles.card, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: palette.color }]}>
          <SymbolView name={{ android: palette.icon }} size={24} tintColor={colors.onSos} />
        </View>
        <View style={[styles.badge, { borderColor: palette.color }]}>
          <AppText variant="caption" color={item.status === 'taken' ? 'success' : item.status === 'late' ? 'sos' : item.status === 'skipped' ? 'textSecondary' : 'warning'}>{labels[item.status]}</AppText>
        </View>
      </View>
      <AppText variant="label">{item.medication.name}</AppText>
      <AppText color="textSecondary">{time}</AppText>
      {actionable && !loading ? (
        <View style={styles.actions}>
          <ReminderAction label="Pris" color="success" onPress={onTaken} />
          <ReminderAction label="Reporter 10 min" color="warning" onPress={onSnooze} />
          <ReminderAction label="Ignorer" color="textSecondary" onPress={onSkipped} />
        </View>
      ) : null}
    </Card>
  );
}

function ReminderAction({ label, color, onPress }: { label: string; color: 'success' | 'warning' | 'textSecondary'; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.actionButton}>
      <AppText variant="caption" color={color}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, minHeight: 194, width: 280 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  icon: { alignItems: 'center', borderRadius: radii.md, height: 56, justifyContent: 'center', width: 56 },
  badge: { borderRadius: radii.full, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  actions: { gap: spacing.xs },
  actionButton: { justifyContent: 'center', minHeight: 44 },
});
