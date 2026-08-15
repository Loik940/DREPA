// Aperçu du jour : résume une entrée du journal et les rappels réels sans interprétation médicale.
// Les cartes restent utiles pendant un chargement ou une erreur partielle et ouvrent les écrans détaillés.
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import type { TodayReminder } from '@/features/medications/status';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { getActionableDashboardReminder, getDashboardMedicationDescription, type DashboardEntry } from './dashboard';
import { DashboardIcon, type DashboardIconName } from './DashboardIcon';

type DashboardTodayOverviewProps = {
  journalEntry: DashboardEntry | null;
  medicationError: boolean;
  medicationPending: boolean;
  reminders: TodayReminder[];
};

export function DashboardTodayOverview({ journalEntry, medicationError, medicationPending, reminders }: DashboardTodayOverviewProps) {
  const router = useRouter();
  const actionableReminder = getActionableDashboardReminder(reminders);
  const journalDescription = journalEntry
    ? `Enregistré à ${formatTime(journalEntry.recorded_at)}`
    : 'Aucune entrée aujourd’hui';
  const medicationDescription = getDashboardMedicationDescription(actionableReminder, reminders.length, medicationPending, medicationError);

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <AppText variant="sectionTitle">Aujourd’hui</AppText>
        <AppText variant="caption" color="textSecondary">Tes repères déclarés</AppText>
      </View>
      <View style={styles.grid}>
        <TodayCard
          description={journalDescription}
          icon="journal"
          label="Journal du jour"
          onPress={() => router.push(journalEntry ? '/(app)/(tabs)/journal' : '/(app)/health-entry')}
          tone="brand"
        />
        <TodayCard
          description={medicationDescription}
          icon="medication"
          label={actionableReminder?.medication.name ?? 'Mes rappels'}
          live
          onPress={() => router.push('/(app)/(tabs)/medications')}
          tone="textPrimary"
        />
      </View>
    </View>
  );
}

function TodayCard({ description, icon, label, live = false, onPress, tone }: {
  description: string;
  icon: DashboardIconName;
  label: string;
  live?: boolean;
  onPress: () => void;
  tone: 'brand' | 'textPrimary';
}) {
  const background = icon === 'medication' ? colors.warningSoft : colors.backgroundMuted;

  return (
    <Pressable
      accessibilityHint="Ouvre la fonctionnalité correspondante"
      accessibilityLabel={`${label}. ${description}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.item, { opacity: pressed ? 0.82 : 1 }]}
    >
      <Card style={styles.card}>
        <View style={[styles.icon, { backgroundColor: background }]}>
          <DashboardIcon color={colors[tone]} name={icon} />
        </View>
        <View style={styles.content}>
          <AppText variant="label">{label}</AppText>
          <AppText accessibilityLiveRegion={live ? 'polite' : 'none'} variant="caption" color="textSecondary">{description}</AppText>
        </View>
        <AppText color={tone}>→</AppText>
      </Card>
    </Pressable>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'heure indisponible'
    : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

const styles = StyleSheet.create({
  section: { gap: spacing.lg },
  heading: { alignItems: 'flex-end', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  item: { flexBasis: '47%', flexGrow: 1, minWidth: 140 },
  card: { alignItems: 'flex-start', borderRadius: radii.xl, gap: spacing.md, minHeight: 168 },
  icon: { alignItems: 'center', borderRadius: radii.lg, height: 44, justifyContent: 'center', width: 44 },
  content: { flex: 1, gap: spacing.xs },
});
