// Protège l’interface d’administration avec le rôle du compte actif.
// Affiche un état clair pendant le contrôle de l’accès.
// Permet de relancer la lecture du rôle après une erreur neutre.
// Renvoie les comptes non autorisés vers leur profil.
// Ce contrôle visuel ne remplace jamais les protections des RPC.
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter, type Href } from 'expo-router';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useCurrentUserRoleQuery } from '@/features/moderation/queries';
import { useAuth } from '@/providers/auth-provider';
import { colors } from '@/theme/colors';

const profileRoute = '/(app)/(tabs)/profile' as Href;

export default function AdminLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const roleQuery = useCurrentUserRoleQuery(user?.id);
  const accessDenied = roleQuery.isSuccess && roleQuery.data !== 'admin';

  useEffect(() => {
    if (!accessDenied) return;

    queryClient.removeQueries({
      predicate: ({ queryKey }) => {
        const root = String(queryKey[0]);
        return (
          root === 'moderation-queue' ||
          root === 'moderation-report' ||
          root === 'moderation-history'
        );
      },
    });
  }, [accessDenied, queryClient]);

  if (roleQuery.isPending || !roleQuery.isFetchedAfterMount) {
    return <LoadingState message="Vérification de l’accès..." />;
  }

  if (roleQuery.isError) {
    return (
      <ErrorState
        description="L’accès à cet espace ne peut pas être vérifié pour le moment."
        onRetry={() => void roleQuery.refetch()}
      />
    );
  }

  if (accessDenied) {
    return (
      <EmptyState
        title="Accès refusé"
        description="Cet espace est réservé aux comptes autorisés."
        actionLabel="Retour au profil"
        onAction={() => router.replace(profileRoute)}
      />
    );
  }

  return <Stack screenOptions={{ headerShadowVisible: false, headerStyle: { backgroundColor: colors.backgroundPrimary }, headerTintColor: colors.brand, headerTitle: '' }} />;
}
