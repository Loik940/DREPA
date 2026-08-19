// Onglet Médicaments : affiche les traitements prescrits saisis et les rappels du jour.
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { Button } from '@/components/ui/Button';
import { MedicationCard } from '@/features/medications/components/MedicationCard';
import { MedicationInfoCard } from '@/features/medications/components/MedicationInfoCard';
import { ReminderCard } from '@/features/medications/components/ReminderCard';
import { useMarkMedicationTakenMutation, useSkipMedicationMutation, useSnoozeMedicationMutation } from '@/features/medications/mutations';
import { useMedicationDashboardQuery } from '@/features/medications/queries';
import { buildTodayReminders } from '@/features/medications/status';
import { useMedicationNotificationHealth } from '@/features/medications/notification-health';
import { useAuth } from '@/providers/auth-provider';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const medicationFormRoute = '/(app)/medication-form' as Href;

export default function MedicationsScreen() {
  // Les hooks préparent la navigation, l’utilisateur, les traitements et les prises.
  const router = useRouter();
  const { user } = useAuth();
  const query = useMedicationDashboardQuery(user?.id);
  const markTaken = useMarkMedicationTakenMutation(user?.id);
  const snooze = useSnoozeMedicationMutation(user?.id);
  const skip = useSkipMedicationMutation(user?.id);
  const actionLockRef = useRef(false);
  const [now, setNow] = useState(() => new Date());
  const [notificationsGranted, setNotificationsGranted] = useState<boolean | null>(null);
  const notificationHealth = useMedicationNotificationHealth();
  const refetch = query.refetch;

  useFocusEffect(useCallback(() => {
    const refresh = () => {
      setNow(new Date());
      void refetch();
      void Notifications.getPermissionsAsync().then(({ granted }) => setNotificationsGranted(granted));
    };
    refresh();
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [refetch]));

  const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);

  // Le verrou synchrone bloque un second appui avant même le prochain rendu React.
  const handleReminderAction = async (actionFn: () => Promise<unknown>) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      await actionFn();
    } catch {
      // TanStack Query conserve l’erreur pour le message visuel ; on évite un rejet non géré côté UI.
    } finally {
      actionLockRef.current = false;
    }
  };

  // Le chargement et l’erreur sont traités avant de construire les rappels.
  if (query.isPending) return <LoadingState message="Chargement des traitements..." />;
  if (query.isError) return <ErrorState description="Tes traitements ne peuvent pas être chargés pour le moment." onRetry={() => void query.refetch()} />;

  // Les rappels du jour sont préparés seulement avec des données disponibles.
  const reminders = buildTodayReminders(query.data.medications, query.data.reminders, query.data.intakes, now);
  const actionLoading = markTaken.isPending || snooze.isPending || skip.isPending;

  // Le rendu principal affiche les rappels, les traitements et leurs états vides.
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

      {notificationsGranted === false ? (
        <View style={styles.notificationWarning}>
          <StatusBanner tone="warning" message="Les notifications Android sont désactivées : les rappels enregistrés dans DRÉPA ne pourront pas être reçus." />
          <Button label="Ouvrir les réglages Android" variant="secondary" onPress={() => void Linking.openSettings()} />
        </View>
      ) : null}
      {notificationHealth === 'error' ? (
        <StatusBanner tone="error" message="Le planning local des rappels n’a pas pu être vérifié. Rouvre l’application ou modifie le traitement avant de compter sur ces notifications." />
      ) : null}
      {notificationHealth === 'checking' || notificationHealth === 'unknown' ? (
        <StatusBanner message="Vérification du planning local des rappels en cours. Leur livraison n’est pas encore confirmée." />
      ) : null}
      {notificationHealth === 'scheduled' ? (
        <StatusBanner message="Le planning local est créé. Android peut toutefois retarder une alarme si l’accès spécial aux alarmes exactes ou l’activité en arrière-plan est limité." />
      ) : null}

      {reminders.length > 0 && (
        <View style={styles.section}>
          <AppText variant="sectionTitle">Rappels d’aujourd’hui</AppText>
          <ScrollView horizontal contentContainerStyle={styles.reminders} showsHorizontalScrollIndicator={false}>
            {reminders.map((item) => (
              <ReminderCard
                item={item}
                key={item.displayId}
                loading={actionLoading}
                onTaken={() => void handleReminderAction(() => markTaken.mutateAsync({ medicationId: item.medication.id, intakeId: item.intakeId, originalScheduledAt: item.originalScheduledAt, snoozeNotificationId: item.snoozeNotificationId, snoozedUntil: item.snoozedUntil }))}
                onSnooze={() => void handleReminderAction(() => snooze.mutateAsync({ medicationId: item.medication.id, intakeId: item.intakeId, originalScheduledAt: item.originalScheduledAt, snoozeNotificationId: item.snoozeNotificationId, snoozedUntil: item.snoozedUntil }))}
                onSkipped={() => void handleReminderAction(() => skip.mutateAsync({ medicationId: item.medication.id, intakeId: item.intakeId, originalScheduledAt: item.originalScheduledAt, snoozeNotificationId: item.snoozeNotificationId, snoozedUntil: item.snoozedUntil }))}
              />
            ))}
          </ScrollView>
        </View>
      )}
      {reminders.length === 0 && query.data.medications.length > 0 && (
        <AppText color="textSecondary">Aucun rappel actif aujourd’hui.</AppText>
      )}
      {markTaken.isError && <AppText accessibilityRole="alert" color="sos">{markTaken.error.message}</AppText>}
      {snooze.isError && <AppText accessibilityRole="alert" color="sos">{snooze.error.message}</AppText>}
      {skip.isError && <AppText accessibilityRole="alert" color="sos">{skip.error.message}</AppText>}

      <View style={styles.section}>
        <AppText variant="sectionTitle">Mes traitements</AppText>
        {query.data.medications.length === 0 ? (
          <EmptyState title="Aucun médicament ajouté" description="Ajoute uniquement les traitements prescrits que tu souhaites organiser dans DRÉPA." actionLabel="Ajouter un médicament" onAction={() => router.push(medicationFormRoute)} />
        ) : (
          <View style={styles.list}>
            {query.data.medications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onPress={() => router.push(`/(app)/medication/${medication.id}` as Href)}
              />
            ))}
          </View>
        )}
      </View>
      <MedicationInfoCard />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxxl, paddingBottom: spacing.huge },
  header: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'space-between' },
  heading: { flex: 1, gap: spacing.xs },
  addButton: { alignItems: 'center', backgroundColor: colors.actionBg, borderRadius: radii.xl, height: 64, justifyContent: 'center', width: 64 },
  section: { gap: spacing.lg },
  reminders: { gap: spacing.md, paddingRight: spacing.screenGutter },
  list: { gap: spacing.md },
  notificationWarning: { gap: spacing.md },
});
