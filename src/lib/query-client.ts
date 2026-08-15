// Instance TanStack Query et helpers de purge/invalidation des données privées par utilisateur.
import { QueryClient } from '@tanstack/react-query';

// Ces options communes évitent des relances excessives tout en gardant les données brièvement fraîches.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
let privateCacheGeneration = 0;

export function getPrivateCacheGeneration() {
  return privateCacheGeneration;
}

// Seules ces racines peuvent contenir des données privées liées à un compte.
const privateQueryRoots = new Set([
  'profile',
  'user-consents',
  'health-logs',
  'health-log',
  'health-log-statistics',
  'medications',
  'community-posts',
  'community-post',
  'community-comments',
  'user-role',
  'moderation-queue',
  'moderation-report',
  'moderation-history',
]);

// La purge retire du cache les données privées du compte ciblé ou de tous les comptes.
export function removePrivateQueries(userId?: string) {
  privateCacheGeneration += 1;
  void queryClient.cancelQueries({
    predicate: ({ queryKey }) =>
      privateQueryRoots.has(String(queryKey[0])) && (!userId || queryKey[1] === userId),
  });
  queryClient.removeQueries({
    predicate: ({ queryKey }) =>
      privateQueryRoots.has(String(queryKey[0])) && (!userId || queryKey[1] === userId),
  });
  queryClient.getMutationCache().clear();
}

// Après connexion, les données privées visibles sont invalidées pour être relues avec la session active.
export async function invalidatePrivateQueries(userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['profile', userId], refetchType: 'active' }),
    queryClient.invalidateQueries({ queryKey: ['user-consents', userId], refetchType: 'active' }),
  ]);
}
