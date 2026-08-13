// Vérifie les contrats métier de la modération.
// Utilise uniquement des valeurs et identifiants fictifs.
// Couvre la validation des décisions et des notes.
// Couvre les règles permettant une restauration.
// Couvre les principales classifications d'erreurs.
import { classifyModerationError } from './errors';
import { canRestore, moderationDecisionSchema } from './schemas';
import type { ModerationReport } from './types';

const report: ModerationReport = {
  report_id: 'report-test',
  target_type: 'post',
  target_id: 'post-test',
  reason: 'other',
  details: null,
  status: 'reviewed',
  report_created_at: '2026-08-13T10:00:00.000Z',
  reviewed_at: '2026-08-13T10:05:00.000Z',
  resolution_note: null,
  author_alias: 'Membre-test',
  content: 'Contenu fictif.',
  category: 'question',
  content_created_at: '2026-08-13T09:00:00.000Z',
  is_hidden: true,
};

describe('moderation contracts', () => {
  it('accepte les décisions autorisées et nettoie la note', () => {
    for (const decision of ['hide', 'dismiss', 'restore'] as const) {
      expect(moderationDecisionSchema.safeParse({ decision }).success).toBe(true);
    }
    expect(moderationDecisionSchema.parse({ decision: 'hide', note: '  Note fictive.  ' }).note).toBe(
      'Note fictive.',
    );
  });

  it('refuse une décision inconnue et une note trop longue', () => {
    expect(moderationDecisionSchema.safeParse({ decision: 'delete' }).success).toBe(false);
    expect(
      moderationDecisionSchema.safeParse({ decision: 'dismiss', note: 'a'.repeat(501) }).success,
    ).toBe(false);
  });

  it('autorise uniquement la restauration d’un contenu masqué, traité et présent', () => {
    expect(canRestore(report)).toBe(true);
    expect(canRestore({ ...report, is_hidden: false })).toBe(false);
    expect(canRestore({ ...report, status: 'pending' })).toBe(false);
    expect(canRestore({ ...report, content: null })).toBe(false);
  });

  it('classe les refus RLS et les conflits', () => {
    expect(classifyModerationError({ status: 403 }, 'list').kind).toBe('rls');
    expect(classifyModerationError({ code: '55000' }, 'decide').kind).toBe('conflict');
  });
});
