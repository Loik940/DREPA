// Gère les écritures autorisées dans la communauté.
// Vérifie la session avant chaque modification distante.
// Ajoute les filtres propriétaire en complément de la RLS.
// Invalide seulement les listes et détails concernés.
// Traite un soutien concurrent déjà créé comme un succès.
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Database } from '@/types/database.types';
import { classifyCommunityError, CommunityDataError, type CommunityOperation } from './errors';
import { buildCommunityCommentPayload, buildCommunityPostPayload } from './payload';
import {
  communityCommentsQueryKey,
  communityPostDetailQueryKey,
  type CommunityReport,
} from './queries';
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

function isDuplicateError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === '23505';
}

export function useCreatePostMutation(userId: string | undefined) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PostValues): Promise<CreatedCommunityContent> => {
      const ownerId = requireUserId(sessionUserId, 'create');
      try {
        const { data, error } = await requireClient('create')
          .from('community_posts')
          .insert(buildCommunityPostPayload(ownerId, values))
          .select('id')
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        throw classifyCommunityError(error, 'create');
      }
    },
    onSuccess: async () => {
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

  return useMutation({
    mutationFn: async (values: CommentValues): Promise<CreatedCommunityContent> => {
      const ownerId = requireUserId(sessionUserId, 'comment');
      if (!postId) throw new CommunityDataError('comment', 'not_found', 'Ce contenu est introuvable.');
      try {
        const { data, error } = await requireClient('comment')
          .from('community_comments')
          .insert(buildCommunityCommentPayload(ownerId, postId, values))
          .select('id')
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        throw classifyCommunityError(error, 'comment');
      }
    },
    onSuccess: async () => {
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
    mutationFn: async (): Promise<{ hasSupported: boolean }> => {
      const ownerId = requireUserId(sessionUserId, 'reaction');
      if (!postId) throw new CommunityDataError('reaction', 'not_found', 'Ce contenu est introuvable.');
      const client = requireClient('reaction');

      try {
        const { data: existing, error: selectError } = await client
          .from('community_post_reactions')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', ownerId)
          .maybeSingle();
        if (selectError) throw selectError;

        if (existing) {
          const { error } = await client
            .from('community_post_reactions')
            .delete()
            .eq('id', existing.id)
            .eq('post_id', postId)
            .eq('user_id', ownerId);
          if (error) throw error;
          return { hasSupported: false };
        }

        const { error } = await client
          .from('community_post_reactions')
          .insert({ post_id: postId, user_id: ownerId, reaction_type: 'support' });
        if (error && !isDuplicateError(error)) throw error;
        return { hasSupported: true };
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

  return useMutation({
    mutationFn: async ({ target, values }: { target: CommunityReportTarget; values: ReportValues }): Promise<CommunityReport> => {
      const ownerId = requireUserId(sessionUserId, 'report');
      try {
        const payload: Database['public']['Tables']['community_reports']['Insert'] = {
          reporter_id: ownerId,
          post_id: target.type === 'post' ? target.postId : null,
          comment_id: target.type === 'comment' ? target.commentId : null,
          reason: values.reason,
          details: values.details || null,
        };
        const { data, error } = await requireClient('report')
          .from('community_reports')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as CommunityReport;
      } catch (error) {
        throw classifyCommunityError(error, 'report');
      }
    },
    onSuccess: async (_data, variables) => {
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
