// Envoie les décisions uniquement par la RPC de modération.
// Vérifie que la session active correspond à la clé privée.
// Ne modifie directement aucune table communautaire.
// Invalide les données administratives après chaque succès.
// Rafraîchit tous les caches communautaires affectés par la visibilité.
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { classifyModerationError, ModerationDataError } from './errors';
import {
  moderationHistoryQueryKey,
  moderationReportQueryKey,
} from './queries';
import type { ModerationDecisionValues } from './schemas';

type ModerationClient = NonNullable<typeof supabase>;

function requireClient(): ModerationClient {
  if (!supabase) throw new ModerationDataError('decide', 'config', 'La modération est indisponible.');
  return supabase;
}

function useSessionUserId(requestedUserId: string | undefined): string | undefined {
  const { sessionReady, status, user } = useAuth();
  if (!sessionReady || status !== 'authenticated' || user?.id !== requestedUserId) return undefined;
  return requestedUserId;
}

async function invalidateModerationCaches(
  queryClient: QueryClient,
  userId: string,
  reportId: string,
) {
  const communityRoots = new Set(['community-posts', 'community-post', 'community-comments']);
  await Promise.all([
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) => queryKey[0] === 'moderation-queue' && queryKey[1] === userId,
    }),
    queryClient.invalidateQueries({ queryKey: moderationReportQueryKey(userId, reportId) }),
    queryClient.invalidateQueries({ queryKey: moderationHistoryQueryKey(userId, reportId) }),
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) => communityRoots.has(String(queryKey[0])),
    }),
  ]);
}

export function useModerateCommunityReportMutation(
  userId: string | undefined,
  reportId: string | undefined,
) {
  const sessionUserId = useSessionUserId(userId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ModerationDecisionValues): Promise<string> => {
      if (!sessionUserId) {
        throw new ModerationDataError('decide', 'session', 'La session est indisponible.');
      }
      if (!reportId) {
        throw new ModerationDataError('decide', 'not_found', 'Ce signalement est introuvable.');
      }

      try {
        const { data, error } = await requireClient().rpc('moderate_community_report', {
          target_report_id: reportId,
          decision: values.decision,
          note: values.note || null,
        });
        if (error) throw error;
        if (data === null) {
          throw new ModerationDataError('decide', 'supabase', 'La décision n’a pas été confirmée.');
        }
        return data;
      } catch (error) {
        throw classifyModerationError(error, 'decide');
      }
    },
    onSuccess: async () => {
      if (sessionUserId && reportId) {
        await invalidateModerationCaches(queryClient, sessionUserId, reportId);
      }
    },
  });
}
