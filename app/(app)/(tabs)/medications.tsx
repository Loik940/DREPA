// Onglet Médicaments : affiche les traitements prescrits saisis et les rappels du jour.
import { useRouter, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { MedicationCard } from '@/features/medications/components/MedicationCard';
import { MedicationInfoCard } from '@/features/medications/components/MedicationInfoCard';
import { ReminderCard } from '@/features/medications/components/ReminderCard';
import { useMarkMedicationTakenMutation } from '@/features/medications/mutations';
import { useMedicationDashboardQuery } from '@/features/medications/queries';
import { buildTodayReminders } from '@/features/medications/status';
import { useAuth } from '@/providers/auth-provider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const medicationFormRoute = '/(app)/medication-form' as Href;

export default function MedicationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const query = useMedicationDashboardQuery(user?.id);
  const markTaken = useMarkMedicationTakenMutation(user?.id);
  const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  if (query.isPending) return <LoadingState message="Chargement des traitements..." />;
  if (query.isError) return <ErrorState description="Tes traitements ne peuvent pas être chargés pour le moment." onRetry={() => void query.refetch()} />;

  const reminders = buildTodayReminders(query.data.medications, query.data.reminders, query.data.intakes);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <AppText variant="title">Mes médicaments</AppText>
          <AppText color="textSecondary">{date}</AppText>
        </View>
        <Pressable accessibilityLabel="Ajouter un médicament" accessibilityRole="button" onPress={() => router.push(medicationFormRoute)} style={styles.addButton}>
          <AppText variant="display" color="actionText">+</AppText>
        </Pressable>
      </View>

      {reminders.length > 0 && (
        <View style={styles.section}>
          <AppText variant="sectionTitle">Rappels d’aujourd’hui</AppText>
          <ScrollView horizontal contentContainerStyle={styles.reminders} showsHorizontalScrollIndicator={false}>
            {reminders.map((item) => (
              <ReminderCard
                item={item}
                key={item.reminder.id}
                loading={markTaken.isPending}
                onTaken={() => markTaken.mutate({ medicationId: item.medication.id, scheduledAt: item.scheduledAt })}
              />
            ))}
          </ScrollView>
        </View>
      )}
      {reminders.length === 0 && query.data.medications.length > 0 && (
        <AppText color="textSecondary">Aucun rappel actif aujourd’hui.</AppText>
      )}
      {markTaken.isError && <AppText color="sos">La prise ne peut pas être enregistrée pour le moment.</AppText>}

      <View style={styles.section}>
        <AppText variant="sectionTitle">Mes traitements</AppText>
        {query.data.medications.length === 0 ? (
          <EmptyState title="Aucun médicament ajouté" description="Ajoute uniquement les traitements prescrits que tu souhaites organiser dans DRÉPA." actionLabel="Ajouter un médicament" onAction={() => router.push(medicationFormRoute)} />
        ) : (
          <View style={styles.list}>
            {query.data.medications.map((medication) => <MedicationCard key={medication.id} medication={medication} />)}
          </View>
        )}
      </View>
      <MedicationInfoCard />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxxl, paddingBottom: spacing.huge },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.lg, justifyContent: 'space-between' },
  heading: { flex: 1, gap: spacing.xs },
  addButton: { alignItems: 'center', backgroundColor: colors.actionBg, borderRadius: radii.xl, height: 64, justifyContent: 'center', width: 64 },
  section: { gap: spacing.lg },
  reminders: { gap: spacing.md, paddingRight: spacing.screenGutter },
  list: { gap: spacing.md },
});
