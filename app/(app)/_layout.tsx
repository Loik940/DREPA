import { Redirect, Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <ScreenPlaceholder title="Chargement" description="Restauration de la session." />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
