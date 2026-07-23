import { Redirect, Stack } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export default function AuthLayout() {
  const { status, isPasswordRecovery } = useAuth();

  if (status === 'loading') {
    return <ScreenPlaceholder title="Chargement" description="Vérification de la session." />;
  }

  if (status === 'error') {
    return <ScreenPlaceholder title="Configuration indisponible" description="La connexion sécurisée ne peut pas être initialisée." />;
  }

  if (status === 'authenticated' && !isPasswordRecovery) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
