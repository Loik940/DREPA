import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const privateQueryRoots = new Set(['profile', 'user-consents']);

export function removePrivateQueries(userId?: string) {
  queryClient.removeQueries({
    predicate: ({ queryKey }) =>
      privateQueryRoots.has(String(queryKey[0])) && (!userId || queryKey[1] === userId),
  });
}

export async function invalidatePrivateQueries(userId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['profile', userId], refetchType: 'active' }),
    queryClient.invalidateQueries({ queryKey: ['user-consents', userId], refetchType: 'active' }),
  ]);
}
