// Accueil dashboard : combine le profil et les entrées récentes pour présenter l’espace personnel.
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ProfileDataError, useProfileQuery } from '@/features/profile/queries';
import {
  DashboardErrorState,
  DashboardLoadingState,
  DashboardRecentActivity,
  DashboardShortcuts,
  DashboardTodayOverview,
  DashboardWeeklySummary,
  FeelingPromptCard,
} from '@/features/dashboard';
import { buildDashboardSummary, flattenDashboardEntries, getLatestDashboardEntry, getTodayDashboardEntry } from '@/features/dashboard/dashboard';
import { HealthLogDataError } from '@/features/health-log/errors';
import { useHealthLogStatisticsSourceQuery } from '@/features/health-log/queries';
import { useMedicationDashboardQuery } from '@/features/medications/queries';
import { buildTodayReminders } from '@/features/medications/status';
import { useMedicationNotificationHealth } from '@/features/medications/notification-health';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export default function DashboardScreen() {
  // Les hooks chargent le profil et les entrées utiles au tableau de bord.
  const { user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const journalQuery = useHealthLogStatisticsSourceQuery(user?.id, 7);
  const medicationQuery = useMedicationDashboardQuery(user?.id);
  const notificationHealth = useMedicationNotificationHealth();
  const [now, setNow] = useState(() => new Date());
  const dayKeyRef = useRef(getLocalDayKey(now));
  const refetchJournal = journalQuery.refetch;
  const refetchMedications = medicationQuery.refetch;

  // L’horloge se recalcule chaque minute et les sources sont rafraîchies au focus ou au changement de jour.
  useFocusEffect(useCallback(() => {
    const refresh = (forceQueries: boolean) => {
      const next = new Date();
      const nextDayKey = getLocalDayKey(next);
      const dayChanged = nextDayKey !== dayKeyRef.current;
      dayKeyRef.current = nextDayKey;
      setNow(next);

      if (forceQueries || dayChanged) {
        void refetchJournal();
        void refetchMedications();
      }
    };

    refresh(true);
    const interval = setInterval(() => refresh(false), 60_000);
    return () => clearInterval(interval);
  }, [refetchJournal, refetchMedications]));

  // Les chargements et les erreurs sont traités avant de calculer le résumé.
  if (profileQuery.isPending || journalQuery.isPending) {
    return (
      <ScreenContainer>
        <DashboardLoadingState />
      </ScreenContainer>
    );
  }

  if (profileQuery.isError) {
    return (
      <ScreenContainer>
        <DashboardErrorState
          message={profileQuery.error instanceof ProfileDataError ? profileQuery.error.message : 'Le profil ne peut pas être chargé.'}
          onRetry={() => void profileQuery.refetch()}
        />
      </ScreenContainer>
    );
  }

  if (journalQuery.isError) {
    return (
      <ScreenContainer>
        <DashboardErrorState
          message={journalQuery.error instanceof HealthLogDataError ? journalQuery.error.message : 'Le journal ne peut pas être chargé.'}
          onRetry={() => void journalQuery.refetch()}
        />
      </ScreenContainer>
    );
  }

  // Le résumé est construit uniquement à partir des données chargées.
  const entries = flattenDashboardEntries({ pages: [journalQuery.data ?? []] });
  const summary = buildDashboardSummary(entries);
  const latestEntry = getLatestDashboardEntry(entries);
  const todayEntry = getTodayDashboardEntry(entries, now);
  const todayReminders = medicationQuery.data
    ? buildTodayReminders(medicationQuery.data.medications, medicationQuery.data.reminders, medicationQuery.data.intakes, now)
    : [];

  // Le rendu principal rassemble l’accueil personnalisé et l’activité récente.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <DashboardHeader firstName={profileQuery.data?.first_name} />
      <FeelingPromptCard />
      <DashboardTodayOverview
        journalEntry={todayEntry}
        medicationError={medicationQuery.isError || notificationHealth === 'error' || notificationHealth === 'permission-denied'}
        medicationPending={medicationQuery.isPending || notificationHealth === 'checking' || notificationHealth === 'unknown'}
        reminders={todayReminders}
      />
      <DashboardShortcuts />
      <DashboardWeeklySummary summary={summary} />
      <DashboardRecentActivity entry={latestEntry} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxxl, paddingBottom: spacing.huge },
});

function getLocalDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
