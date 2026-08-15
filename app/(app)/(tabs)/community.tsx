// Affiche le fil réel de la communauté authentifiée.
// Permet de filtrer les questions et les témoignages.
// Ouvre les formulaires de publication et de signalement.
// Protège chaque soutien contre les doubles appuis rapides.
// Rappelle que les échanges ne remplacent pas un avis médical.
import { useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import type { CommunityFilter } from '@/features/community/categories';
import { CommunityEmptyState } from '@/features/community/components/CommunityEmptyState';
import { CommunityFilters } from '@/features/community/components/CommunityFilters';
import { CommunityHeader } from '@/features/community/components/CommunityHeader';
import { CommunitySafetyBanner } from '@/features/community/components/CommunitySafetyBanner';
import { PostCard } from '@/features/community/components/PostCard';
import { useToggleSupportMutation } from '@/features/community/mutations';
import { useCommunityPostsQuery, type CommunityPostFeedItem } from '@/features/community/queries';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

const newPostRoute = '/(app)/community/new' as Href;

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<CommunityFilter>('all');
  const postsQuery = useCommunityPostsQuery(user?.id, filter);
  const posts = postsQuery.data?.pages.flat() ?? [];
  const openNewPost = () => router.push(newPostRoute);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <CommunityHeader onPublish={openNewPost} />
      <CommunityFilters value={filter} onChange={setFilter} />
      <CommunitySafetyBanner onOpenCharter={() => router.push('/(auth)/legal')} />

      {postsQuery.isPending ? <LoadingState message="Chargement des publications..." /> : null}
      {postsQuery.isError && posts.length === 0 ? (
        <ErrorState
          description="Les publications ne peuvent pas être chargées pour le moment."
          onRetry={() => void postsQuery.refetch()}
        />
      ) : null}
      {postsQuery.isSuccess && posts.length === 0 ? <CommunityEmptyState onPublish={openNewPost} /> : null}

      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
          userId={user?.id}
          onOpen={() => router.push(`/(app)/community/${post.id}` as Href)}
          onReport={() => router.push(`/(app)/community/report?postId=${encodeURIComponent(post.id)}` as Href)}
        />
      ))}

      {postsQuery.isFetchNextPageError ? (
        <StatusBanner tone="error" message="Les publications suivantes ne peuvent pas être chargées pour le moment." />
      ) : null}
      {postsQuery.hasNextPage ? (
        <Button
          label="Charger plus"
          loading={postsQuery.isFetchingNextPage}
          onPress={() => void postsQuery.fetchNextPage()}
          variant="secondary"
        />
      ) : null}
    </ScreenContainer>
  );
}

type FeedPostCardProps = {
  post: CommunityPostFeedItem;
  userId: string | undefined;
  onOpen: () => void;
  onReport: () => void;
};

function FeedPostCard({ post, userId, onOpen, onReport }: FeedPostCardProps) {
  const supportMutation = useToggleSupportMutation(userId, post.id);
  const supportLockRef = useRef(false);
  const [supportError, setSupportError] = useState(false);

  // Le verrou est posé avant l’appel asynchrone, sans attendre le prochain rendu de la mutation.
  const handleSupport = async () => {
    if (supportLockRef.current) return;
    supportLockRef.current = true;
    setSupportError(false);
    try {
      await supportMutation.mutateAsync();
    } catch {
      setSupportError(true);
    } finally {
      supportLockRef.current = false;
    }
  };

  return (
    <View style={styles.postGroup}>
      <PostCard
        post={post}
        onOpen={onOpen}
        onSupport={() => void handleSupport()}
        onReport={onReport}
        supportLoading={supportMutation.isPending}
      />
      {supportError ? (
        <StatusBanner tone="error" message="Le soutien ne peut pas être modifié pour le moment." />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  postGroup: { gap: spacing.sm },
});
