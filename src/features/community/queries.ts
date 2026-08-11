// Charge le fil, le détail et les commentaires de la communauté.
// Attend une session authentifiée avant chaque lecture.
// Pagine les publications et commentaires avec un curseur stable.
// Ajoute uniquement le soutien du membre connecté aux résultats.
// Lit des vues qui ne révèlent jamais les identifiants des membres.
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Database } from '@/types/database.types';
import type { CommunityFilter } from './categories';
import { classifyCommunityError, CommunityDataError, type CommunityOperation } from './errors';

export type CommunityPost = Database['public']['Views']['community_posts_feed']['Row'];
export type CommunityComment = Database['public']['Views']['community_comments_feed']['Row'];
export type CommunityPostReaction = Database['public']['Tables']['community_post_reactions']['Row'];
export type CommunityReport = Database['public']['Tables']['community_reports']['Row'];
export type CommunityPostFeedItem = CommunityPost & { has_supported: boolean };
export type CommunityPostDetail = CommunityPostFeedItem;
export type CommunityCursor = { createdAt: string; id: string };

export const COMMUNITY_POSTS_PAGE_SIZE = 10;
export const COMMUNITY_COMMENTS_PAGE_SIZE = 20;

export const communityPostsQueryKey = (userId: string, filter: CommunityFilter) =>
  ['community-posts', userId, filter] as const;
export const communityPostDetailQueryKey = (userId: string, id: string) =>
  ['community-post', userId, id] as const;
export const communityCommentsQueryKey = (userId: string, postId: string) =>
  ['community-comments', userId, postId] as const;

type CommunityClient = NonNullable<typeof supabase>;

function requireClient(operation: CommunityOperation): CommunityClient {
  if (!supabase) {
    throw new CommunityDataError(operation, 'config', 'La communauté est indisponible.');
  }
  return supabase;
}

// La seconde lecture ne récupère que les réactions du membre pour les publications de la page.
async function addOwnSupport(
  client: CommunityClient,
  userId: string,
  posts: readonly CommunityPost[],
): Promise<CommunityPostFeedItem[]> {
  const postIds = posts.map((post) => post.id);
  if (postIds.length === 0) return [];

  const { data, error } = await client
    .from('community_post_reactions')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);

  if (error) throw error;
  const supportedIds = new Set((data ?? []).map((reaction) => reaction.post_id));
  return posts.map((post) => ({ ...post, has_supported: supportedIds.has(post.id) }));
}

async function fetchCommunityPostsPage(
  userId: string,
  filter: CommunityFilter,
  cursor: CommunityCursor | null,
): Promise<CommunityPostFeedItem[]> {
  try {
    const client = requireClient('list');
    let query = client
      .from('community_posts_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });

    if (filter === 'question' || filter === 'testimony') query = query.eq('category', filter);
    // En ordre décroissant, la page suivante commence avant la dernière paire date et identifiant.
    if (cursor) {
      query = query.or(
        `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
      );
    }

    const { data, error } = await query.limit(COMMUNITY_POSTS_PAGE_SIZE);
    if (error) throw error;
    return await addOwnSupport(client, userId, data ?? []);
  } catch (error) {
    throw classifyCommunityError(error, 'list');
  }
}

async function fetchCommunityPostDetail(userId: string, id: string): Promise<CommunityPostDetail> {
  try {
    const client = requireClient('detail');
    const [postResult, reactionResult] = await Promise.all([
      client.from('community_posts_feed').select('*').eq('id', id).maybeSingle(),
      client
        .from('community_post_reactions')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    if (postResult.error) throw postResult.error;
    if (reactionResult.error) throw reactionResult.error;
    if (!postResult.data) {
      throw new CommunityDataError('detail', 'not_found', 'Ce contenu est introuvable.');
    }
    return { ...postResult.data, has_supported: Boolean(reactionResult.data) };
  } catch (error) {
    throw classifyCommunityError(error, 'detail');
  }
}

async function fetchCommunityCommentsPage(
  userId: string,
  postId: string,
  cursor: CommunityCursor | null,
): Promise<CommunityComment[]> {
  try {
    let query = requireClient('comment')
      .from('community_comments_feed')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    // En ordre croissant, la page suivante commence après la dernière paire date et identifiant.
    if (cursor) {
      query = query.or(
        `created_at.gt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.gt.${cursor.id})`,
      );
    }

    const { data, error } = await query.limit(COMMUNITY_COMMENTS_PAGE_SIZE);

    if (!userId) throw new CommunityDataError('comment', 'session', 'La session est indisponible.');
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw classifyCommunityError(error, 'comment');
  }
}

function useCommunityAccess(userId: string | undefined) {
  const { sessionReady, status, user } = useAuth();
  const sessionUserId = user?.id;
  return {
    enabled: sessionReady && status === 'authenticated' && Boolean(userId) && sessionUserId === userId,
    sessionUserId,
  };
}

function requireQueryUser(
  userId: string | undefined,
  sessionUserId: string | undefined,
  operation: 'list' | 'detail' | 'comment',
): string {
  if (!userId || sessionUserId !== userId) {
    throw new CommunityDataError(operation, 'session', 'La session est indisponible.');
  }
  return userId;
}

export function useCommunityPostsQuery(userId: string | undefined, filter: CommunityFilter) {
  const access = useCommunityAccess(userId);

  return useInfiniteQuery({
    queryKey: userId ? communityPostsQueryKey(userId, filter) : ['community-posts', 'anonymous', filter],
    queryFn: ({ pageParam }) =>
      fetchCommunityPostsPage(requireQueryUser(userId, access.sessionUserId, 'list'), filter, pageParam),
    initialPageParam: null as CommunityCursor | null,
    getNextPageParam: (lastPage) => {
      const lastPost = lastPage.at(-1);
      return lastPage.length === COMMUNITY_POSTS_PAGE_SIZE && lastPost
        ? { createdAt: lastPost.created_at, id: lastPost.id }
        : undefined;
    },
    enabled: access.enabled,
  });
}

export function useCommunityPostDetailQuery(userId: string | undefined, id: string | undefined) {
  const access = useCommunityAccess(userId);

  return useQuery({
    queryKey: userId && id ? communityPostDetailQueryKey(userId, id) : ['community-post', 'anonymous'],
    queryFn: () => fetchCommunityPostDetail(requireQueryUser(userId, access.sessionUserId, 'detail'), id as string),
    enabled: access.enabled && Boolean(id),
  });
}

export function useCommunityCommentsQuery(userId: string | undefined, postId: string | undefined) {
  const access = useCommunityAccess(userId);

  return useInfiniteQuery({
    queryKey: userId && postId ? communityCommentsQueryKey(userId, postId) : ['community-comments', 'anonymous'],
    queryFn: ({ pageParam }) =>
      fetchCommunityCommentsPage(requireQueryUser(userId, access.sessionUserId, 'comment'), postId as string, pageParam),
    initialPageParam: null as CommunityCursor | null,
    getNextPageParam: (lastPage) => {
      const lastComment = lastPage.at(-1);
      return lastPage.length === COMMUNITY_COMMENTS_PAGE_SIZE && lastComment
        ? { createdAt: lastComment.created_at, id: lastComment.id }
        : undefined;
    },
    enabled: access.enabled && Boolean(postId),
  });
}
