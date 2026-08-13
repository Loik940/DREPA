// Charge un signalement réel sans afficher ses identifiants techniques.
// Présente le contenu et la raison sans décision automatique.
// Envoie chaque décision par la mutation RPC sécurisée.
// Bloque les doubles validations avant la mise à jour de React.
// Garde les erreurs neutres et l’historique sans identité administrative.
import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { reportReasonLabels } from '@/features/community/categories';
import { formatRelativeCommunityDate } from '@/features/community/format';
import { ModerationDecisionForm } from '@/features/moderation/components/ModerationDecisionForm';
import { ModerationHistoryList } from '@/features/moderation/components/ModerationHistoryList';
import { ModerationStatusBadge } from '@/features/moderation/components/ModerationStatusBadge';
import { ModerationDataError } from '@/features/moderation/errors';
import { useModerateCommunityReportMutation } from '@/features/moderation/mutations';
import {
  useModerationHistoryQuery,
  useModerationReportQuery,
} from '@/features/moderation/queries';
import type { ModerationDecisionValues } from '@/features/moderation/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const targetTypeLabels = {
  post: 'Publication',
  comment: 'Commentaire',
} as const;

export default function ModerationReportScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const reportQuery = useModerationReportQuery(user?.id, id);
  const historyQuery = useModerationHistoryQuery(user?.id, id);
  const decisionMutation = useModerateCommunityReportMutation(user?.id, id);
  const decisionLockRef = useRef(false);
  const [decisionSuccess, setDecisionSuccess] = useState(false);
  const [decisionError, setDecisionError] = useState<string | undefined>();

  const submitDecision = async (values: ModerationDecisionValues) => {
    if (decisionLockRef.current) return;
    decisionLockRef.current = true;
    setDecisionSuccess(false);
    setDecisionError(undefined);
    try {
      await decisionMutation.mutateAsync(values);
      setDecisionSuccess(true);
    } catch {
      setDecisionError('La décision ne peut pas être enregistrée pour le moment.');
    } finally {
      decisionLockRef.current = false;
    }
  };

  if (reportQuery.isPending) {
    return <LoadingState message="Chargement du signalement..." />;
  }

  if (reportQuery.isError) {
    const isNotFound =
      reportQuery.error instanceof ModerationDataError &&
      reportQuery.error.kind === 'not_found';
    return (
      <ErrorState
        title={isNotFound ? 'Signalement introuvable' : undefined}
        description={
          isNotFound
            ? 'Ce signalement n’est plus disponible.'
            : 'Le signalement ne peut pas être chargé pour le moment.'
        }
        onRetry={isNotFound ? undefined : () => void reportQuery.refetch()}
      />
    );
  }

  if (!reportQuery.data) {
    return (
      <ErrorState
        title="Signalement introuvable"
        description="Ce signalement n’est plus disponible."
      />
    );
  }

  const report = reportQuery.data;
  const reasonLabel =
    reportReasonLabels.find(({ value }) => value === report.reason)?.label ?? 'Autre';
  const targetTypeLabel = targetTypeLabels[report.target_type];
  const alias = report.author_alias ?? 'Pseudonyme indisponible';
  const relativeDate = formatRelativeCommunityDate(report.report_created_at);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.title}>
          Signalement
        </AppText>
        <ModerationStatusBadge status={report.status} />
      </View>

      {decisionSuccess ? (
        <StatusBanner tone="success" message="La décision a bien été enregistrée." />
      ) : null}

      <Card style={styles.section}>
        <DetailRow label="Type" value={targetTypeLabel} />
        <DetailRow label="Motif" value={reasonLabel} />
        <DetailRow label="Pseudonyme" value={alias} />
        <DetailRow label="Signalé" value={relativeDate} />
      </Card>

      <Card style={styles.section}>
        <AppText variant="sectionTitle">Contenu signalé</AppText>
        <AppText color={report.content ? 'textPrimary' : 'textSecondary'}>
          {report.content ?? 'Contenu indisponible'}
        </AppText>
      </Card>

      <Card style={styles.section}>
        <AppText variant="sectionTitle">Détails du signalement</AppText>
        <AppText color={report.details ? 'textPrimary' : 'textSecondary'}>
          {report.details ?? 'Aucun détail fourni.'}
        </AppText>
      </Card>

      <ModerationDecisionForm
        report={report}
        loading={decisionMutation.isPending}
        onSubmit={submitDecision}
        error={decisionError}
      />

      <View style={styles.history}>
        <AppText variant="sectionTitle">Historique</AppText>
        {historyQuery.isPending ? <LoadingState message="Chargement de l’historique..." /> : null}
        {historyQuery.isError ? (
          <ErrorState
            description="L’historique ne peut pas être chargé pour le moment."
            onRetry={() => void historyQuery.refetch()}
          />
        ) : null}
        {historyQuery.isSuccess ? (
          <ModerationHistoryList
            items={historyQuery.data}
            emptyMessage="Aucune décision enregistrée."
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText color="textSecondary">{label}</AppText>
      <AppText style={styles.value}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  title: { flex: 1 },
  section: { gap: spacing.md },
  history: { gap: spacing.md },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  value: { flex: 1, textAlign: 'right' },
});
