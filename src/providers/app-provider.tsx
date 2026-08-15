// Provider racine : compose le cache TanStack Query et la session Auth pour toute l’application.
import type { PropsWithChildren } from 'react';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { StartupProvider } from './startup-provider';

// Le cache enveloppe l’authentification afin que la gestion de session puisse purger les données privées.
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <StartupProvider>{children}</StartupProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
