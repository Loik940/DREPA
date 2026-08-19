// Gère les écritures autorisées dans la communauté.
// Vérifie la session avant chaque modification distante.
// Ajoute les filtres propriétaire en complément de la RLS.
// Invalide seulement les listes et détails concernés.
// Traite un soutien concurrent déjà créé comme un succès.
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { clearOperationId, getOrCreateOperationId } from '@/services/operation-id';
import type { Database } from '@/types/database.types';
import { classifyCommunityError, CommunityDataError, type CommunityOperation } from './errors';
import { buildCommunityCommentPayload, buildCommunityPostPayload } from './payload';
import { communityCommentsQueryKey, communityPostDetailQueryKey } from './queries';
import type { CommentValues, PostValues, ReportValues } from './schemas';

type CommunityClient = NonNullable<typeof supabase>;
type CreatedCommunityContent = { id: string };
export type CommunityReportTarget =
  | { type: 'post'; postId: string }
  | { type: 'comment'; postId: string; commentId: string };

function requireClient(operation: CommunityOperation): CommunityClient {
  if (!supabase) throw new CommunityDataError(operation, 'config', 'La communauté est indisponible.');
  return supabase;
}

function useSessionUserId(requestedUserId: string | undefined): string | undefined {
  const { sessionReady, status, user } = useAuth();
  if (!sessionReady || status !== 'authenticated' || user?.id !== requestedUserId) return undefined;
  return requestedUserId;
}

function requireUserId(userId: string | undefined, operation: CommunityOperation): string {
  if (!userId) throw new CommunityDataError(operation, 'session', 'La session est indisponible.');
  return userId;
}

async function invalidateFeed(queryClient: QueryClient, userId: string) {
  await queryClient.invalidateQueries({ queryKey: ['community-posts', userId] });
}

async function invalidatePost(
  queryClient: QueryClient,
  userId: string,
  postId: string,
  comments = false,
) {
  const invalidations = [
    invalidateFeed(queryClient, userId),
    queryClient.invalidateQueries({ queryKey: communityPostDetailQueryKey(userId, postId) }),
  ];
  if (comments) {
    invalidations.push(queryClient.invalidateQueries({ queryKey: communityCommentsQueryKey(userId, postId) }));
  }
  await Promise.all(invalidations);
}

export function useCreatePostMutation(userId: string | undefined) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();
  const operationKey = `community-post:${sessionUserId ?? 'anonymous'}`;

  return useMutation({
    mutationFn: async (values: PostValues): Promise<CreatedCommunityContent> => {
      const ownerId = requireUserId(sessionUserId, 'create');
      const operationId = await getOrCreateOperationId(operationKey, values);
      try {
        const { data, error } = await requireClient('create')
          .from('community_posts')
          .insert({ id: operationId, ...buildCommunityPostPayload(ownerId, values) })
          .select('id')
          .single();
        if (!error) return data;
        if (['23505', 'P0001'].includes((error as { code?: string }).code ?? '')) {
          const existing = await requireClient('create').from('community_posts').select('id').eq('id', operationId).maybeSingle();
          if (!existing.error && existing.data) return existing.data;
        }
        throw error;
      } catch (error) {
        throw classifyCommunityError(error, 'create');
      }
    },
    onSuccess: async () => {
      await clearOperationId(operationKey);
      if (sessionUserId) await invalidateFeed(queryClient, sessionUserId);
    },
  });
}

export function useDeletePostMutation(
  userId: string | undefined,
  postId: string | undefined,
) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<string> => {
      requireUserId(sessionUserId, 'delete');
      if (!postId) throw new CommunityDataError('delete', 'not_found', 'Ce contenu est introuvable.');
      try {
        const { data, error } = await requireClient('delete')
          .from('community_posts')
          .update({ deleted_at: new Date().toISOString(), is_hidden: true })
          .eq('id', postId)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new CommunityDataError('delete', 'not_found', 'Ce contenu est introuvable.');
        return data.id;
      } catch (error) {
        throw classifyCommunityError(error, 'delete');
      }
    },
    onSuccess: async () => {
      if (!sessionUserId || !postId) return;
      queryClient.removeQueries({ queryKey: communityPostDetailQueryKey(sessionUserId, postId) });
      queryClient.removeQueries({ queryKey: communityCommentsQueryKey(sessionUserId, postId) });
      await invalidateFeed(queryClient, sessionUserId);
    },
  });
}

export function useCreateCommentMutation(
  userId: string | undefined,
  postId: string | undefined,
) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();
  const operationKey = `community-comment:${sessionUserId ?? 'anonymous'}:${postId ?? 'missing'}`;

  return useMutation({
    mutationFn: async (values: CommentValues): Promise<CreatedCommunityContent> => {
      const ownerId = requireUserId(sessionUserId, 'comment');
      const operationId = await getOrCreateOperationId(operationKey, values);
      if (!postId) throw new CommunityDataError('comment', 'not_found', 'Ce contenu est introuvable.');
      try {
        const { data, error } = await requireClient('comment')
          .from('community_comments')
          .insert({ id: operationId, ...buildCommunityCommentPayload(ownerId, postId, values) })
          .select('id')
          .single();
        if (!error) return data;
        if (['23505', 'P0001'].includes((error as { code?: string }).code ?? '')) {
          const existing = await requireClient('comment').from('community_comments').select('id').eq('id', operationId).maybeSingle();
          if (!existing.error && existing.data) return existing.data;
        }
        throw error;
      } catch (error) {
        throw classifyCommunityError(error, 'comment');
      }
    },
    onSuccess: async () => {
      await clearOperationId(operationKey);
      if (sessionUserId && postId) await invalidatePost(queryClient, sessionUserId, postId, true);
    },
  });
}

export function useDeleteCommentMutation(
  userId: string | undefined,
  postId: string | undefined,
  commentId: string | undefined,
) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<string> => {
      requireUserId(sessionUserId, 'comment');
      if (!postId || !commentId) {
        throw new CommunityDataError('comment', 'not_found', 'Ce commentaire est introuvable.');
      }
      try {
        const { data, error } = await requireClient('comment')
          .from('community_comments')
          .update({ deleted_at: new Date().toISOString(), is_hidden: true })
          .eq('id', commentId)
          .eq('post_id', postId)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new CommunityDataError('comment', 'not_found', 'Ce commentaire est introuvable.');
        return data.id;
      } catch (error) {
        throw classifyCommunityError(error, 'comment');
      }
    },
    onSuccess: async () => {
      if (sessionUserId && postId) await invalidatePost(queryClient, sessionUserId, postId, true);
    },
  });
}

export function useToggleSupportMutation(
  userId: string | undefined,
  postId: string | undefined,
) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (desiredState: boolean): Promise<{ hasSupported: boolean }> => {
      requireUserId(sessionUserId, 'reaction');
      if (!postId) throw new CommunityDataError('reaction', 'not_found', 'Ce contenu est introuvable.');
      const client = requireClient('reaction');

      try {
        const { data, error } = await client.rpc('set_community_post_support', {
          target_post_id: postId,
          desired_state: desiredState,
        });
        if (error) throw error;
        return { hasSupported: data?.[0]?.has_supported ?? desiredState };
      } catch (error) {
        throw classifyCommunityError(error, 'reaction');
      }
    },
    onSuccess: async () => {
      if (sessionUserId && postId) await invalidatePost(queryClient, sessionUserId, postId);
    },
  });
}

export function useReportMutation(userId: string | undefined) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();
  const operationKeyPrefix = `community-report:${sessionUserId ?? 'anonymous'}`;

  return useMutation({
    mutationFn: async ({
      target,
      values,
    }: {
      target: CommunityReportTarget;
      values: ReportValues;
    }): Promise<CreatedCommunityContent> => {
      const ownerId = requireUserId(sessionUserId, 'report');
      const operationKey = `${operationKeyPrefix}:${target.type}:${target.type === 'post' ? target.postId : target.commentId}`;
      const operationId = await getOrCreateOperationId(operationKey, { target, values });
      try {
        const payload: Database['public']['Tables']['community_reports']['Insert'] = {
          id: operationId,
          reporter_id: ownerId,
          post_id: target.type === 'post' ? target.postId : null,
          comment_id: target.type === 'comment' ? target.commentId : null,
          reason: values.reason,
          details: values.details || null,
        };
        const { data, error } = await requireClient('report')
          .from('community_reports')
          .insert(payload)
          .select('id')
          .single();
        if (!error) return data;
        if (['23505', 'P0001'].includes((error as { code?: string }).code ?? '')) {
          const existing = await requireClient('report').from('community_reports').select('id').eq('id', operationId).maybeSingle();
          if (!existing.error && existing.data) return existing.data;
        }
        throw error;
      } catch (error) {
        throw classifyCommunityError(error, 'report');
      }
    },
    onSuccess: async (_data, variables) => {
      const target = variables.target;
      await clearOperationId(`${operationKeyPrefix}:${target.type}:${target.type === 'post' ? target.postId : target.commentId}`);
      if (!sessionUserId) return;
      await invalidatePost(
        queryClient,
        sessionUserId,
        variables.target.postId,
        variables.target.type === 'comment',
      );
    },
  });
}
