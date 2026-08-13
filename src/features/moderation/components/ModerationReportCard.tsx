// Résume un signalement sans montrer ses identifiants techniques.
// Traduit le type et le motif avec des mots simples.
// Affiche le pseudonyme public et la date du signalement.
// Limite le contenu visible à quatre lignes.
// Sépare le résumé accessible du bouton d’ouverture.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { reportReasonLabels } from '@/features/community/categories';
import { formatRelativeCommunityDate } from '@/features/community/format';
import { spacing } from '@/theme/spacing';
import type { ModerationReport } from '../types';
import { ModerationStatusBadge } from './ModerationStatusBadge';

type ModerationReportCardProps = {
  report: ModerationReport;
  onOpen: () => void;
};

const targetTypeLabels = {
  post: 'Publication',
  comment: 'Commentaire',
} as const;

const statusLabels = {
  pending: 'En attente',
  reviewed: 'Traité',
  dismissed: 'Rejeté',
} as const;

export function ModerationReportCard({ report, onOpen }: ModerationReportCardProps) {
  const targetTypeLabel = targetTypeLabels[report.target_type];
  const reasonLabel =
    reportReasonLabels.find(({ value }) => value === report.reason)?.label ?? 'Autre';
  const alias = report.author_alias ?? 'Pseudonyme indisponible';
  const content = report.content ?? 'Contenu indisponible';
  const relativeDate = formatRelativeCommunityDate(report.report_created_at);

  return (
    <Card style={styles.card}>
      <View
        accessible
        accessibilityLabel={`${targetTypeLabel}, statut ${statusLabels[report.status]}, motif ${reasonLabel}, ${alias}, ${relativeDate}. ${content}`}
        accessibilityRole="summary"
        style={styles.summary}
      >
        <View style={styles.header}>
          <AppText variant="sectionTitle" style={styles.type}>
            {targetTypeLabel}
          </AppText>
          <ModerationStatusBadge status={report.status} />
        </View>
        <View style={styles.metadata}>
          <AppText variant="label">{reasonLabel}</AppText>
          <AppText variant="caption" color="textSecondary">
            {alias} · {relativeDate}
          </AppText>
        </View>
        <AppText numberOfLines={4}>{content}</AppText>
      </View>
      <Button
        accessibilityHint="Ouvre le détail du signalement."
        accessibilityLabel={`Consulter le signalement concernant ${targetTypeLabel.toLowerCase()}`}
        label="Consulter"
        onPress={onOpen}
        variant="secondary"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  summary: { gap: spacing.md },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  type: { flex: 1 },
  metadata: { gap: spacing.xs },
});
