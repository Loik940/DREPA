// Provider TanStack Query : rend le QueryClient partagé disponible aux écrans et mutations.
import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

import { queryClient } from '../lib/query-client';

// Ce provider partage une seule instance de cache entre tous les écrans descendants.
export function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
