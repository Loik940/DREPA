// Affiche un commentaire réel de la communauté.
// Présente son pseudonyme, sa date et son contenu.
// Autorise la suppression seulement pour son auteur.
// Autorise le signalement seulement pour les autres auteurs.
// Désactive l’action visible pendant son chargement.
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { formatRelativeCommunityDate } from '../format';
import type { CommunityComment } from '../queries';

type CommentCardProps = {
  comment: CommunityComment;
  isOwn: boolean;
  onDelete: () => void;
  onReport: () => void;
  loading: boolean;
};

export function CommentCard({ comment, isOwn, onDelete, onReport, loading }: CommentCardProps) {
  const actionLabel = isOwn ? 'Supprimer' : 'Signaler';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="label" style={styles.alias} numberOfLines={1}>
          {comment.author_alias}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {formatRelativeCommunityDate(comment.created_at)}
        </AppText>
      </View>
      <AppText>{comment.content}</AppText>
      <Pressable
        accessibilityLabel={`${actionLabel} ce commentaire`}
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: loading }}
        disabled={loading}
        onPress={isOwn ? onDelete : onReport}
        style={({ pressed }) => [
          styles.action,
          { opacity: loading ? 0.55 : pressed ? 0.72 : 1 },
        ]}
      >
        <AppText variant="label" color="sos">
          {actionLabel}
        </AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  alias: { flex: 1 },
  action: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.sm,
  },
});
