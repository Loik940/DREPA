// Valide une décision de modération avant son envoi.
// Limite la note facultative à cinq cents caractères.
// Nettoie les espaces placés autour de la note.
// Détermine sans effet de bord si une restauration est permise.
// Refuse la restauration d'un contenu absent ou déjà visible.
import { z } from 'zod';

import type { ModerationReport } from './types';

export const moderationDecisionSchema = z.object({
  decision: z.enum(['hide', 'dismiss', 'restore']),
  note: z.string().trim().max(500, 'La note est trop longue.').optional(),
});

export type ModerationDecisionValues = z.infer<typeof moderationDecisionSchema>;

export function canRestore(report: ModerationReport): boolean {
  return report.is_hidden === true && report.status === 'reviewed' && report.content !== null;
}
