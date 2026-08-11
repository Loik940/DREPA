// Prépare les champs autorisés pour les créations communautaires.
// Garde l’identité issue de la session dans chaque écriture.
// Exclut les pseudonymes calculés uniquement par Supabase.
// Exclut les compteurs, la visibilité et les dates système.
// Ces fonctions pures rendent le contrat client facile à tester.
import type { Database } from '@/types/database.types';
import type { CommentValues, PostValues } from './schemas';

export type CommunityPostInsertPayload = Pick<
  Database['public']['Tables']['community_posts']['Insert'],
  'user_id' | 'category' | 'content'
>;

export type CommunityCommentInsertPayload = Pick<
  Database['public']['Tables']['community_comments']['Insert'],
  'post_id' | 'user_id' | 'content'
>;

export function buildCommunityPostPayload(userId: string, values: PostValues): CommunityPostInsertPayload {
  return {
    user_id: userId,
    category: values.category,
    content: values.content,
  };
}

export function buildCommunityCommentPayload(
  userId: string,
  postId: string,
  values: CommentValues,
): CommunityCommentInsertPayload {
  return {
    post_id: postId,
    user_id: userId,
    content: values.content,
  };
}
