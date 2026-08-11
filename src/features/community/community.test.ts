// Vérifie les contrats métier de la communauté.
// Utilise seulement des textes et identifiants fictifs.
// Couvre les catégories et motifs autorisés.
// Couvre les limites de longueur des contenus.
// Couvre les principales classifications d’erreurs.
import {
  COMMUNITY_CATEGORY_VALUES,
  communityCategoryLabels,
  REPORT_REASON_VALUES,
  reportReasonLabels,
} from './categories';
import { classifyCommunityError } from './errors';
import { buildCommunityCommentPayload, buildCommunityPostPayload } from './payload';
import { commentSchema, postSchema, reportSchema } from './schemas';

describe('community contracts', () => {
  const validPost = {
    category: 'testimony' as const,
    content: 'Message communautaire fictif.',
    charterAccepted: true as const,
  };

  it('accepte toutes les catégories et expose leurs libellés', () => {
    expect(communityCategoryLabels.map(({ value }) => value)).toEqual(COMMUNITY_CATEGORY_VALUES);
    for (const category of COMMUNITY_CATEGORY_VALUES) {
      expect(postSchema.safeParse({ ...validPost, category }).success).toBe(true);
    }
  });

  it('exige la charte et un contenu non vide', () => {
    expect(postSchema.safeParse({ ...validPost, charterAccepted: false }).success).toBe(false);
    expect(postSchema.safeParse({ ...validPost, content: '   ' }).success).toBe(false);
  });

  it('nettoie les espaces autour des publications et commentaires', () => {
    const postResult = postSchema.parse({ ...validPost, content: '  Message fictif.  ' });
    const commentResult = commentSchema.parse({ content: '  Commentaire fictif.  ' });
    expect(postResult.content).toBe('Message fictif.');
    expect(commentResult.content).toBe('Commentaire fictif.');
  });

  it('construit des créations sans alias, compteurs ou visibilité client', () => {
    const postPayload = buildCommunityPostPayload('user-test', validPost);
    const commentPayload = buildCommunityCommentPayload('user-test', 'post-test', {
      content: 'Commentaire fictif.',
    });

    expect(postPayload).toEqual({
      user_id: 'user-test',
      category: 'testimony',
      content: 'Message communautaire fictif.',
    });
    expect(commentPayload).toEqual({
      post_id: 'post-test',
      user_id: 'user-test',
      content: 'Commentaire fictif.',
    });
    expect(postPayload).not.toHaveProperty('author_alias');
    expect(postPayload).not.toHaveProperty('support_count');
    expect(postPayload).not.toHaveProperty('comments_count');
    expect(postPayload).not.toHaveProperty('is_hidden');
    expect(commentPayload).not.toHaveProperty('author_alias');
    expect(commentPayload).not.toHaveProperty('is_hidden');
  });

  it('limite une publication à 2000 caractères', () => {
    expect(postSchema.safeParse({ ...validPost, content: 'a'.repeat(2000) }).success).toBe(true);
    expect(postSchema.safeParse({ ...validPost, content: 'a'.repeat(2001) }).success).toBe(false);
  });

  it('limite un commentaire à 1000 caractères', () => {
    expect(commentSchema.safeParse({ content: 'b'.repeat(1000) }).success).toBe(true);
    expect(commentSchema.safeParse({ content: 'b'.repeat(1001) }).success).toBe(false);
  });

  it('accepte tous les motifs et expose leurs libellés', () => {
    expect(reportReasonLabels.map(({ value }) => value)).toEqual(REPORT_REASON_VALUES);
    for (const reason of REPORT_REASON_VALUES) {
      expect(reportSchema.safeParse({ reason, details: 'Signalement fictif.' }).success).toBe(true);
    }
  });

  it('limite les précisions d’un signalement à 500 caractères', () => {
    expect(reportSchema.safeParse({ reason: 'other', details: 'c'.repeat(500) }).success).toBe(true);
    expect(reportSchema.safeParse({ reason: 'other', details: 'c'.repeat(501) }).success).toBe(false);
  });

  it('classe les refus RLS, limites et doublons', () => {
    expect(classifyCommunityError({ status: 403 }, 'list').kind).toBe('rls');
    expect(classifyCommunityError({ code: 'P0001' }, 'create').kind).toBe('rate_limit');
    expect(classifyCommunityError({ code: '23505' }, 'reaction').kind).toBe('duplicate');
  });
});
