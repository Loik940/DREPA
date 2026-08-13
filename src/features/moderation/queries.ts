// Charge le niveau d'accès, la file, le détail et l'historique de modération.
// Attend une session authentifiée correspondant à chaque clé privée.
// Laisse les RPC administrateur contrôler toutes les autorisations.
// Pagine la file avec une paire date et identifiant stable.
// Classe chaque erreur distante avant de l'exposer au reste de l'application.
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Database } from '@/types/database.types';
import {
  classifyModerationError,
  ModerationDataError,
  type ModerationOperation,
} from './errors';
import type { ModerationHistoryItem, ModerationReport, ModerationStatus } from './types';

export type CurrentAccessLevel = Database['public']['Tables']['user_roles']['Row']['role'];
export type ModerationCursor = { createdAt: string; id: string };

export const MODERATION_PAGE_SIZE = 20;

export const userRoleQueryKey = (userId: string) => ['user-role', userId] as const;
export const moderationQueueQueryKey = (userId: string, status: ModerationStatus) =>
  ['moderation-queue', userId, status] as const;
export const moderationReportQueryKey = (userId: string, reportId: string) =>
  ['moderation-report', userId, reportId] as const;
export const moderationHistoryQueryKey = (userId: string, reportId: string) =>
  ['moderation-history', userId, reportId] as const;

type ModerationClient = NonNullable<typeof supabase>;

function requireClient(operation: ModerationOperation): ModerationClient {
  if (!supabase) {
    throw new ModerationDataError(operation, 'config', 'La modération est indisponible.');
  }
  return supabase;
}

function useModerationAccess(userId: string | undefined) {
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
  operation: ModerationOperation,
): string {
  if (!userId || sessionUserId !== userId) {
    throw new ModerationDataError(operation, 'session', 'La session est indisponible.');
  }
  return userId;
}

async function fetchCurrentUserRole(userId: string): Promise<CurrentAccessLevel | null> {
  try {
    const { data, error } = await requireClient('role')
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data?.role ?? null;
  } catch (error) {
    throw classifyModerationError(error, 'role');
  }
}

async function fetchModerationQueuePage(
  status: ModerationStatus,
  cursor: ModerationCursor | null,
): Promise<ModerationReport[]> {
  try {
    const { data, error } = await requireClient('list').rpc('get_community_moderation_queue', {
      target_status: status,
      cursor_created_at: cursor?.createdAt ?? null,
      cursor_id: cursor?.id ?? null,
      page_size: MODERATION_PAGE_SIZE,
    });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw classifyModerationError(error, 'list');
  }
}

async function fetchModerationReport(reportId: string): Promise<ModerationReport | null> {
  try {
    const { data, error } = await requireClient('detail').rpc('get_community_moderation_report', {
      target_report_id: reportId,
    });
    if (error) throw error;
    return data?.[0] ?? null;
  } catch (error) {
    throw classifyModerationError(error, 'detail');
  }
}

async function fetchModerationHistory(reportId: string): Promise<ModerationHistoryItem[]> {
  try {
    const { data, error } = await requireClient('history').rpc('get_community_moderation_history', {
      target_report_id: reportId,
    });
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    throw classifyModerationError(error, 'history');
  }
}

export function useCurrentUserRoleQuery(userId: string | undefined) {
  const access = useModerationAccess(userId);
  return useQuery({
    queryKey: userId ? userRoleQueryKey(userId) : ['user-role', 'anonymous'],
    queryFn: () => fetchCurrentUserRole(requireQueryUser(userId, access.sessionUserId, 'role')),
    enabled: access.enabled,
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
}

export function useModerationQueueQuery(
  userId: string | undefined,
  status: ModerationStatus = 'pending',
) {
  const access = useModerationAccess(userId);
  return useInfiniteQuery({
    queryKey: userId ? moderationQueueQueryKey(userId, status) : ['moderation-queue', 'anonymous', status],
    queryFn: ({ pageParam }) => {
      requireQueryUser(userId, access.sessionUserId, 'list');
      return fetchModerationQueuePage(status, pageParam);
    },
    initialPageParam: null as ModerationCursor | null,
    getNextPageParam: (lastPage) => {
      const lastReport = lastPage.at(-1);
      return lastPage.length === MODERATION_PAGE_SIZE && lastReport
        ? { createdAt: lastReport.report_created_at, id: lastReport.report_id }
        : undefined;
    },
    enabled: access.enabled,
  });
}

export function useModerationReportQuery(
  userId: string | undefined,
  reportId: string | undefined,
) {
  const access = useModerationAccess(userId);
  return useQuery({
    queryKey:
      userId && reportId ? moderationReportQueryKey(userId, reportId) : ['moderation-report', 'anonymous'],
    queryFn: () => {
      requireQueryUser(userId, access.sessionUserId, 'detail');
      return fetchModerationReport(reportId as string);
    },
    enabled: access.enabled && Boolean(reportId),
  });
}

export function useModerationHistoryQuery(
  userId: string | undefined,
  reportId: string | undefined,
) {
  const access = useModerationAccess(userId);
  return useQuery({
    queryKey:
      userId && reportId ? moderationHistoryQueryKey(userId, reportId) : ['moderation-history', 'anonymous'],
    queryFn: () => {
      requireQueryUser(userId, access.sessionUserId, 'history');
      return fetchModerationHistory(reportId as string);
    },
    enabled: access.enabled && Boolean(reportId),
  });
}
