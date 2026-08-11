// Affiche une publication réelle du fil communautaire.
// Sépare la zone d’ouverture des autres actions tactiles.
// Dérive un avatar texte depuis le pseudonyme public.
// Limite l’aperçu du contenu à quatre lignes.
// Se limite au texte et aux actions communautaires prévues.
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';
import { formatRelativeCommunityDate, getCommunityCategoryLabel } from '../format';
import type { CommunityPostFeedItem } from '../queries';
import { SupportButton } from './SupportButton';

type PostCardProps = {
  post: CommunityPostFeedItem;
  onOpen?: () => void;
  onSupport: () => void;
  onReport: () => void;
  supportLoading: boolean;
};

function getAliasInitials(alias: string): string {
  const words = alias.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word.charAt(0)).join('').toLocaleUpperCase('fr-FR') || '?';
}

function getCommentsLabel(count: number): string {
  return `${count} commentaire${count === 1 ? '' : 's'}`;
}

export function PostCard({ post, onOpen, onSupport, onReport, supportLoading }: PostCardProps) {
  const { colors } = useAppTheme();
  const commentsLabel = getCommentsLabel(post.comments_count);
  const content = (
    <>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundMuted }]}>
          <AppText variant="label" color="brand">
            {getAliasInitials(post.author_alias)}
          </AppText>
        </View>
        <View style={styles.author}>
          <AppText variant="label" numberOfLines={1}>
            {post.author_alias}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {formatRelativeCommunityDate(post.created_at)}
          </AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.backgroundMuted }]}>
          <AppText variant="caption" color="brand">
            {getCommunityCategoryLabel(post.category)}
          </AppText>
        </View>
      </View>
      <AppText numberOfLines={onOpen ? 4 : undefined}>{post.content}</AppText>
    </>
  );

  return (
    <Card style={styles.card}>
      {onOpen ? (
        <Pressable
          accessibilityHint="Ouvre la publication et ses commentaires."
          accessibilityLabel={`Publication de ${post.author_alias}`}
          accessibilityRole="button"
          onPress={onOpen}
          style={({ pressed }) => [styles.contentArea, { opacity: pressed ? 0.82 : 1 }]}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.contentArea}>{content}</View>
      )}

      <View style={styles.actions}>
        <SupportButton
          supported={post.has_supported}
          count={post.support_count}
          loading={supportLoading}
          onPress={onSupport}
        />
        {onOpen ? (
          <Pressable
            accessibilityHint="Ouvre la publication et ses commentaires."
            accessibilityLabel={commentsLabel}
            accessibilityRole="button"
            onPress={onOpen}
            style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.72 : 1 }]}
          >
            <AppText variant="label" color="textSecondary">
              {commentsLabel}
            </AppText>
          </Pressable>
        ) : (
          <View accessibilityLabel={commentsLabel} style={styles.textAction}>
            <AppText variant="label" color="textSecondary">
              {commentsLabel}
            </AppText>
          </View>
        )}
        <Pressable
          accessibilityHint="Ouvre le formulaire de signalement."
          accessibilityLabel="Signaler cette publication"
          accessibilityRole="button"
          onPress={onReport}
          style={({ pressed }) => [styles.textAction, { opacity: pressed ? 0.72 : 1 }]}
        >
          <AppText variant="label" color="sos">
            Signaler
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  contentArea: { gap: spacing.md },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  avatar: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: sizes.avatarSmall,
    justifyContent: 'center',
    width: sizes.avatarSmall,
  },
  author: { flex: 1, minWidth: 0 },
  badge: { borderRadius: radii.full, flexShrink: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  actions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  textAction: { justifyContent: 'center', minHeight: sizes.touchTarget, paddingHorizontal: spacing.sm },
});
