// Queries Journal : charge les entrées et statistiques de l’utilisateur avec session et RLS.
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Database } from '@/types/database.types';
import { classifyHealthLogError, HealthLogDataError } from './errors';
import { getStatisticsWindowStart } from './statistics';

export type HealthLog = Database['public']['Tables']['health_logs']['Row'];
export const HEALTH_LOG_PAGE_SIZE = 20;

export const healthLogsQueryKey = (userId: string) => ['health-logs', userId] as const;
export const healthLogDetailQueryKey = (userId: string, entryId: string) => ['health-log', userId, entryId] as const;
export const healthLogStatisticsQueryKey = (userId: string, days: number) => ['health-log-statistics', userId, days] as const;

// Queries propriétaires : chaque lecture filtre explicitement sur l’utilisateur authentifié, en complément de la RLS.
function requireClient(operation: 'list' | 'detail' | 'statistics') {
  if (!supabase) {
    throw new HealthLogDataError(operation, 'configuration', 'La configuration du journal est indisponible.');
  }
  return supabase;
}

type HealthLogCursor = { recordedAt: string; id: string } | null;

async function fetchHealthLogsPage(userId: string, cursor: HealthLogCursor) {
  try {
    let query = requireClient('list')
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(HEALTH_LOG_PAGE_SIZE);

    if (cursor) {
      query = query.or(`recorded_at.lt.${cursor.recordedAt},and(recorded_at.eq.${cursor.recordedAt},id.lt.${cursor.id})`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data ?? []) as HealthLog[];
  } catch (error) {
    throw classifyHealthLogError(error, 'list');
  }
}

async function fetchHealthLog(userId: string, entryId: string) {
  try {
    const { data, error } = await requireClient('detail')
      .from('health_logs')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new HealthLogDataError('detail', 'not_found', 'Cette entrée du journal est introuvable.');
    return data as HealthLog;
  } catch (error) {
    throw classifyHealthLogError(error, 'detail');
  }
}

async function fetchStatisticsSource(userId: string, days: number) {
  try {
    const fromDate = getStatisticsWindowStart(days);
    const { data, error } = await requireClient('statistics')
      .from('health_logs')
      .select('id, pain_level, fatigue_level, symptoms, possible_triggers, medication_taken, recorded_at')
      .eq('user_id', userId)
      .gte('recorded_at', fromDate)
      .order('recorded_at', { ascending: false })
      .limit(1000);

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw classifyHealthLogError(error, 'statistics');
  }
}

function useHealthLogAccess(userId: string | undefined) {
  const { sessionReady, status, user } = useAuth();
  return sessionReady && status === 'authenticated' && Boolean(userId) && user?.id === userId;
}

export function useHealthLogsQuery(userId: string | undefined) {
  const enabled = useHealthLogAccess(userId);

  return useInfiniteQuery({
    queryKey: userId ? healthLogsQueryKey(userId) : ['health-logs', 'anonymous'],
    queryFn: ({ pageParam }) => fetchHealthLogsPage(userId as string, pageParam),
    initialPageParam: null as HealthLogCursor,
    getNextPageParam: (lastPage) => {
      const lastEntry = lastPage.at(-1);
      return lastPage.length === HEALTH_LOG_PAGE_SIZE && lastEntry
        ? { recordedAt: lastEntry.recorded_at, id: lastEntry.id }
        : undefined;
    },
    enabled,
  });
}

export function useHealthLogQuery(userId: string | undefined, entryId: string | undefined) {
  const enabled = useHealthLogAccess(userId) && Boolean(entryId);

  return useQuery({
    queryKey: userId && entryId ? healthLogDetailQueryKey(userId, entryId) : ['health-log', 'anonymous'],
    queryFn: () => fetchHealthLog(userId as string, entryId as string),
    enabled,
  });
}

export function useHealthLogStatisticsSourceQuery(userId: string | undefined, days = 30) {
  const enabled = useHealthLogAccess(userId);

  return useQuery({
    queryKey: userId ? healthLogStatisticsQueryKey(userId, days) : ['health-log-statistics', 'anonymous', days],
    queryFn: () => fetchStatisticsSource(userId as string, days),
    enabled,
  });
}
