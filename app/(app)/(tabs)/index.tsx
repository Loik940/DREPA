// Accueil dashboard : combine le profil et les entrées récentes pour présenter l’espace personnel.
import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ProfileDataError, useProfileQuery } from '@/features/profile/queries';
import {
  DashboardErrorState,
  DashboardLoadingState,
  DashboardRecentActivity,
  DashboardShortcuts,
  DashboardWeeklySummary,
  FeelingPromptCard,
} from '@/features/dashboard';
import { buildDashboardSummary, flattenDashboardEntries, getLatestDashboardEntry } from '@/features/dashboard/dashboard';
import { HealthLogDataError } from '@/features/health-log/errors';
import { useHealthLogStatisticsSourceQuery } from '@/features/health-log/queries';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export default function DashboardScreen() {
  // Les hooks chargent le profil et les entrées utiles au tableau de bord.
  const { user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const journalQuery = useHealthLogStatisticsSourceQuery(user?.id, 7);

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

  // Le rendu principal rassemble l’accueil personnalisé et l’activité récente.
  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <DashboardHeader firstName={profileQuery.data?.first_name} />
      <FeelingPromptCard />
      <DashboardShortcuts />
      <DashboardWeeklySummary summary={summary} />
      <DashboardRecentActivity entry={latestEntry} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, paddingBottom: spacing.xxxl },
});
