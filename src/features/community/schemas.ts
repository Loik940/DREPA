// Valide les publications avant leur envoi.
// Valide les commentaires avec une longueur limitée.
// Valide les signalements et leur motif autorisé.
// Supprime les espaces inutiles autour des textes.
// Exporte des types déduits pour les formulaires et mutations.
import { z } from 'zod';

import { COMMUNITY_CATEGORY_VALUES, REPORT_REASON_VALUES } from './categories';

export const postSchema = z.object({
  category: z.enum(COMMUNITY_CATEGORY_VALUES),
  content: z.string().trim().min(1, 'Écrivez un message.').max(2000, 'Le message est trop long.'),
  charterAccepted: z.boolean().refine((accepted) => accepted, 'Vous devez accepter la charte.'),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, 'Écrivez un commentaire.').max(1000, 'Le commentaire est trop long.'),
});

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASON_VALUES),
  details: z.string().trim().max(500, 'Les précisions sont trop longues.').optional(),
});

export type PostValues = z.infer<typeof postSchema>;
export type CommentValues = z.infer<typeof commentSchema>;
export type ReportValues = z.infer<typeof reportSchema>;
