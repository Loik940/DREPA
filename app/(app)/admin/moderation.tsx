// Affiche uniquement les signalements fournis par la file sécurisée.
// Permet de filtrer les dossiers selon leur statut de traitement.
// Conserve les identifiants techniques uniquement pour la navigation.
// Présente des erreurs neutres sans détail du serveur.
// Les RPC administrateur restent responsables des autorisations réelles.
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { SingleChoiceChips } from '@/features/health-log/components/ChoiceChips';
import { ModerationEmptyState } from '@/features/moderation/components/ModerationEmptyState';
import { ModerationReportCard } from '@/features/moderation/components/ModerationReportCard';
import { useModerationQueueQuery } from '@/features/moderation/queries';
import type { ModerationStatus } from '@/features/moderation/types';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const filterChoices = [
  { label: 'En attente', value: 'pending' },
  { label: 'Traités', value: 'reviewed' },
  { label: 'Rejetés', value: 'dismissed' },
] as const satisfies readonly { label: string; value: ModerationStatus }[];

export default function ModerationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<ModerationStatus>('pending');
  const queueQuery = useModerationQueueQuery(user?.id, status);
  const reports = queueQuery.data?.pages.flat() ?? [];

  const updateStatus = (value: string | null) => {
    const nextStatus = filterChoices.find((choice) => choice.value === value)?.value;
    if (nextStatus) setStatus(nextStatus);
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title">Modération</AppText>
        <AppText color="textSecondary">
          Examine les signalements de la communauté avec attention et transparence.
        </AppText>
      </View>

      <SingleChoiceChips choices={filterChoices} selected={status} onChange={updateStatus} />

      {queueQuery.isPending ? <LoadingState message="Chargement des signalements..." /> : null}
      {queueQuery.isError && !queueQuery.data ? (
        <ErrorState
          description="Les signalements ne peuvent pas être chargés pour le moment."
          onRetry={() => void queueQuery.refetch()}
        />
      ) : null}
      {queueQuery.isSuccess && reports.length === 0 ? (
        <ModerationEmptyState status={status} />
      ) : null}

      {reports.map((report) => (
        <ModerationReportCard
          key={report.report_id}
          report={report}
          onOpen={() =>
            router.push(
              `/(app)/admin/report/${encodeURIComponent(report.report_id)}` as Href,
            )
          }
        />
      ))}

      {queueQuery.isFetchNextPageError ? (
        <StatusBanner
          tone="error"
          message="Les signalements suivants ne peuvent pas être chargés pour le moment."
        />
      ) : null}
      {queueQuery.hasNextPage ? (
        <Button
          label="Charger plus"
          variant="secondary"
          loading={queueQuery.isFetchingNextPage}
          onPress={() => void queueQuery.fetchNextPage()}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { gap: spacing.sm },
});
