// Affiche les décisions passées dans leur ordre reçu.
// Traduit chaque action avec un libellé français.
// Montre la date et la note sans identité administrative.
// Ignore entièrement les identifiants techniques.
// Peut rester vide ou afficher un court message.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { formatRelativeCommunityDate } from '@/features/community/format';
import { spacing } from '@/theme/spacing';
import type { ModerationHistoryItem } from '../types';

type ModerationHistoryListProps = {
  items: readonly ModerationHistoryItem[];
  emptyMessage?: string;
};

const actionLabels: Record<ModerationHistoryItem['action'], string> = {
  hide_post: 'Publication masquée',
  hide_comment: 'Commentaire masqué',
  dismiss_report: 'Signalement rejeté',
  restore_post: 'Publication restaurée',
  restore_comment: 'Commentaire restauré',
};

export function ModerationHistoryList({ items, emptyMessage }: ModerationHistoryListProps) {
  if (items.length === 0) {
    return emptyMessage ? <AppText color="textSecondary">{emptyMessage}</AppText> : null;
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <Card key={`${item.created_at}-${index}`} style={styles.item}>
          <View style={styles.header}>
            <AppText variant="label" style={styles.action}>
              {actionLabels[item.action]}
            </AppText>
            <AppText variant="caption" color="textSecondary">
              {formatRelativeCommunityDate(item.created_at)}
            </AppText>
          </View>
          {item.note ? <AppText color="textSecondary">{item.note}</AppText> : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  item: { gap: spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
});
