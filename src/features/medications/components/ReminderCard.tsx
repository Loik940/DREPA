// Carte compacte d’un rappel du jour avec statut calculé et actions déclaratives.
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { DashboardIcon } from '@/features/dashboard/DashboardIcon';
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
    ? { color: colors.sos, background: colors.errorSoft }
    : item.status === 'taken'
      ? { color: colors.success, background: colors.successSoft }
      : item.status === 'skipped'
        ? { color: colors.textSecondary, background: colors.backgroundMuted }
        : { color: colors.warningText, background: colors.warningSoft };
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.scheduledAt));
  const actionable = item.status === 'pending' || item.status === 'late' || item.status === 'snoozed';

  return (
    <Card accessibilityState={{ busy: loading }} style={[styles.card, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: palette.color }]}>
          <DashboardIcon color={colors.onSos} name="notification" />
        </View>
        <View style={[styles.badge, { borderColor: palette.color }]}>
          <AppText variant="caption" color={item.status === 'taken' ? 'success' : item.status === 'late' ? 'sos' : item.status === 'skipped' ? 'textSecondary' : 'warningText'}>{labels[item.status]}</AppText>
        </View>
      </View>
      <AppText variant="label">{item.medication.name}</AppText>
      <AppText color="textSecondary">{time}</AppText>
      {actionable && !loading ? (
        <View style={styles.actions}>
          <ReminderAction confirm label="Pris" color="success" onPress={onTaken} />
          <ReminderAction label="Reporter 10 min" color="warningText" onPress={onSnooze} />
          <ReminderAction confirm label="Ignorer" color="textSecondary" onPress={onSkipped} />
        </View>
      ) : loading ? <ActivityIndicator accessibilityLabel="Enregistrement en cours" color={colors.brand} /> : null}
    </Card>
  );
}

function ReminderAction({ label, color, confirm = false, onPress }: { label: string; color: 'success' | 'warningText' | 'textSecondary'; confirm?: boolean; onPress: () => void }) {
  const handlePress = () => {
    if (!confirm) {
      onPress();
      return;
    }
    Alert.alert('Confirmer la déclaration ?', `Marquer ce rappel comme « ${label} » dans DRÉPA ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress },
    ]);
  };
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={handlePress} style={styles.actionButton}>
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
  actionButton: { justifyContent: 'center', minHeight: 52 },
});
