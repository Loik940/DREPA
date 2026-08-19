// Définit les états possibles d'un signalement.
// Définit les décisions envoyées à la RPC sécurisée.
// Réutilise le contrat strict généré pour la file de modération.
// Expose le format minimal de l'historique administratif.
// Ne contient aucun identifiant de membre ni donnée médicale.
import type { Database } from '@/types/database.types';

export type ModerationStatus = 'pending' | 'reviewed' | 'dismissed';
export type ModerationDecision = 'hide' | 'dismiss' | 'restore';
export type ModerationReport =
  Database['public']['Functions']['get_community_moderation_queue']['Returns'][number] & { can_restore?: boolean };
export type ModerationHistoryItem =
  Database['public']['Functions']['get_community_moderation_history']['Returns'][number];
