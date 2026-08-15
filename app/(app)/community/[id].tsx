// Affiche une publication et ses commentaires réels.
// Réserve les suppressions aux auteurs authentifiés.
// Protège le soutien contre les doubles appuis rapides.
// Envoie les signalements vers le formulaire de modération.
// Ne présente aucun échange comme un avis médical.
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TextField } from '@/components/ui/TextField';
import { CommentCard } from '@/features/community/components/CommentCard';
import { CommunitySafetyBanner } from '@/features/community/components/CommunitySafetyBanner';
import { PostCard } from '@/features/community/components/PostCard';
import { CommunityDataError } from '@/features/community/errors';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useDeletePostMutation,
  useToggleSupportMutation,
} from '@/features/community/mutations';
import {
  useCommunityCommentsQuery,
  useCommunityPostDetailQuery,
  type CommunityComment,
} from '@/features/community/queries';
import { commentSchema, type CommentValues } from '@/features/community/schemas';
import { useAuth } from '@/providers/auth-provider';
import { spacing } from '@/theme/spacing';

export default function CommunityPostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const postQuery = useCommunityPostDetailQuery(user?.id, id);
  const commentsQuery = useCommunityCommentsQuery(user?.id, id);
  const supportMutation = useToggleSupportMutation(user?.id, id);
  const createCommentMutation = useCreateCommentMutation(user?.id, id);
  const deletePostMutation = useDeletePostMutation(user?.id, id);
  const supportLockRef = useRef(false);
  const commentLockRef = useRef(false);
  const [supportError, setSupportError] = useState(false);
  const { control, handleSubmit, reset, setError, formState } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });
  const isCreatingComment = formState.isSubmitting || createCommentMutation.isPending;

  // Le verrou refuse une seconde réaction avant que React reflète le chargement.
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

  const onSubmitComment = async (values: CommentValues) => {
    if (commentLockRef.current) return;
    commentLockRef.current = true;
    try {
      await createCommentMutation.mutateAsync(values);
      reset({ content: '' });
    } catch {
      setError('root', { message: 'Le commentaire ne peut pas être publié pour le moment.' });
    } finally {
      commentLockRef.current = false;
    }
  };

  // Une publication n’est retirée qu’après confirmation et réussite côté serveur.
  const confirmDeletePost = () => {
    Alert.alert(
      'Supprimer cette publication ?',
      'La publication et ses commentaires ne seront plus visibles dans la communauté.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void deletePostMutation.mutateAsync()
              .then(() => router.replace('/(app)/(tabs)/community'))
              .catch(() => undefined);
          },
        },
      ],
    );
  };

  if (postQuery.isPending) return <LoadingState message="Chargement de la publication..." />;
  if (postQuery.isError) {
    const notFound = postQuery.error instanceof CommunityDataError && postQuery.error.kind === 'not_found';
    return (
      <ErrorState
        title={notFound ? 'Publication introuvable' : undefined}
        description={notFound ? 'Cette publication n’est plus disponible.' : 'La publication ne peut pas être chargée pour le moment.'}
        onRetry={notFound ? undefined : () => void postQuery.refetch()}
      />
    );
  }
  if (!postQuery.data) return <ErrorState title="Publication introuvable" description="Cette publication n’est plus disponible." />;

  const post = postQuery.data;
  const comments = commentsQuery.data?.pages.flat() ?? [];
  const postReportRoute = `/(app)/community/report?postId=${encodeURIComponent(post.id)}` as Href;

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <AppText variant="title">Publication</AppText>
      <CommunitySafetyBanner onOpenCharter={() => router.push('/(auth)/legal')} />
      <PostCard
        post={post}
        onSupport={() => void handleSupport()}
        onReport={() => router.push(postReportRoute)}
        supportLoading={supportMutation.isPending}
      />
      {supportError ? <StatusBanner tone="error" message="Le soutien ne peut pas être modifié pour le moment." /> : null}

      {post.is_own ? (
        <Button
          label="Supprimer la publication"
          variant="danger"
          loading={deletePostMutation.isPending}
          onPress={confirmDeletePost}
        />
      ) : null}
      {deletePostMutation.isError ? (
        <StatusBanner tone="error" message="La publication ne peut pas être supprimée pour le moment." />
      ) : null}

      <View style={styles.section}>
        <AppText variant="sectionTitle">Commentaires</AppText>
        <Card style={styles.commentForm}>
          <Controller
            control={control}
            name="content"
            render={({ field, fieldState }) => (
              <TextField
                label="Votre commentaire"
                multiline
                maxLength={1000}
                numberOfLines={4}
                placeholder="Écrivez un commentaire"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                error={fieldState.error?.message}
                style={styles.commentInput}
              />
            )}
          />
          {formState.errors.root?.message ? (
            <AppText accessibilityRole="alert" color="sos">{formState.errors.root.message}</AppText>
          ) : null}
          <Button
            label="Publier le commentaire"
            disabled={isCreatingComment}
            loading={isCreatingComment}
            onPress={() => void handleSubmit(onSubmitComment)()}
          />
        </Card>

        {commentsQuery.isPending ? <LoadingState message="Chargement des commentaires..." /> : null}
        {commentsQuery.isError && comments.length === 0 ? (
          <ErrorState
            description="Les commentaires ne peuvent pas être chargés pour le moment."
            onRetry={() => void commentsQuery.refetch()}
          />
        ) : null}
        {commentsQuery.isSuccess && comments.length === 0 ? (
          <AppText color="textSecondary">Aucun commentaire pour le moment.</AppText>
        ) : null}

        {comments.map((comment) => (
          <CommunityCommentCard
            key={comment.id}
            comment={comment}
            postId={post.id}
            userId={user?.id}
            onReport={() => router.push(
              `/(app)/community/report?postId=${encodeURIComponent(post.id)}&commentId=${encodeURIComponent(comment.id)}` as Href,
            )}
          />
        ))}

        {commentsQuery.isFetchNextPageError ? (
          <StatusBanner tone="error" message="Les commentaires suivants ne peuvent pas être chargés pour le moment." />
        ) : null}
        {commentsQuery.hasNextPage ? (
          <Button
            label="Charger plus de commentaires"
            variant="secondary"
            loading={commentsQuery.isFetchingNextPage}
            onPress={() => void commentsQuery.fetchNextPage()}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

type CommunityCommentCardProps = {
  comment: CommunityComment;
  postId: string;
  userId: string | undefined;
  onReport: () => void;
};

function CommunityCommentCard({ comment, postId, userId, onReport }: CommunityCommentCardProps) {
  const deleteMutation = useDeleteCommentMutation(userId, postId, comment.id);
  const deleteLockRef = useRef(false);

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer ce commentaire ?',
      'Ce commentaire ne sera plus visible dans la communauté.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            if (deleteLockRef.current) return;
            deleteLockRef.current = true;
            void deleteMutation.mutateAsync()
              .catch(() => undefined)
              .finally(() => {
                deleteLockRef.current = false;
              });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.commentGroup}>
      <CommentCard
        comment={comment}
        isOwn={comment.is_own}
        loading={deleteMutation.isPending}
        onDelete={confirmDelete}
        onReport={onReport}
      />
      {deleteMutation.isError ? (
        <StatusBanner tone="error" message="Le commentaire ne peut pas être supprimé pour le moment." />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.huge },
  section: { gap: spacing.md },
  commentForm: { gap: spacing.md },
  commentInput: { minHeight: 100, textAlignVertical: 'top' },
  commentGroup: { gap: spacing.sm },
});
