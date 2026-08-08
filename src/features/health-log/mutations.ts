// Mutations Journal : crée, modifie et supprime les entrées privées avec invalidation du cache.
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { classifyHealthLogError, HealthLogDataError, type HealthLogOperation } from './errors';
import { buildHealthLogPayload } from './payload';
import { healthLogDetailQueryKey, healthLogsQueryKey, healthLogStatisticsQueryKey } from './queries';
import type { HealthLogValues } from './schemas';

// Mutations propriétaires : les écritures exigent une session et restent limitées aux données de son utilisateur.
function requireClient(operation: HealthLogOperation) {
  if (!supabase) {
    throw new HealthLogDataError(operation, 'configuration', 'La configuration du journal est indisponible.');
  }
  return supabase;
}

// Invalidation du cache : la liste et les statistiques sont rechargées après chaque écriture réussie.
async function invalidateHealthLogQueries(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: healthLogsQueryKey(userId) }),
    queryClient.invalidateQueries({ queryKey: ['health-log-statistics', userId] }),
  ]);
}

export function useCreateHealthLogMutation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: HealthLogValues) => {
      if (!userId) throw new HealthLogDataError('create', 'session', 'La session utilisateur est indisponible.');

      try {
        const { data, error } = await requireClient('create')
          .from('health_logs')
          .insert({ user_id: userId, ...buildHealthLogPayload(values) })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        throw classifyHealthLogError(error, 'create');
      }
    },
    onSuccess: async () => {
      if (userId) await invalidateHealthLogQueries(queryClient, userId);
    },
  });
}

export function useUpdateHealthLogMutation(userId: string | undefined, entryId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: HealthLogValues) => {
      if (!userId || !entryId) throw new HealthLogDataError('update', 'session', 'La session utilisateur est indisponible.');

      try {
        const { data, error } = await requireClient('update')
          .from('health_logs')
          .update(buildHealthLogPayload(values))
          .eq('id', entryId)
          .eq('user_id', userId)
          .select()
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new HealthLogDataError('update', 'not_found', 'Cette entrée du journal est introuvable.');
        return data;
      } catch (error) {
        throw classifyHealthLogError(error, 'update');
      }
    },
    onSuccess: async (data) => {
      if (!userId || !entryId) return;
      queryClient.setQueryData(healthLogDetailQueryKey(userId, entryId), data);
      await invalidateHealthLogQueries(queryClient, userId);
    },
  });
}

export function useDeleteHealthLogMutation(userId: string | undefined, entryId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId || !entryId) throw new HealthLogDataError('delete', 'session', 'La session utilisateur est indisponible.');

      try {
        const { data, error } = await requireClient('delete')
          .from('health_logs')
          .delete()
          .eq('id', entryId)
          .eq('user_id', userId)
          .select('id')
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new HealthLogDataError('delete', 'not_found', 'Cette entrée du journal est introuvable.');
        return data.id;
      } catch (error) {
        throw classifyHealthLogError(error, 'delete');
      }
    },
    onSuccess: async () => {
      if (!userId || !entryId) return;
      queryClient.removeQueries({ queryKey: healthLogDetailQueryKey(userId, entryId) });
      await invalidateHealthLogQueries(queryClient, userId);
    },
  });
}

export { healthLogStatisticsQueryKey };
