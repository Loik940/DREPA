// Layout public : protège les écrans d’authentification et laisse passer la récupération de session.
import { Redirect, Stack, useSegments } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export default function AuthLayout() {
  const { status, isPasswordRecovery } = useAuth();
  const segments = useSegments() as string[];
  const isCallbackRoute = segments.includes('callback');

  if (status === 'loading') {
    return <ScreenPlaceholder title="Chargement" description="Vérification de la session." />;
  }

  if (status === 'error') {
    return <ScreenPlaceholder title="Configuration indisponible" description="La connexion sécurisée ne peut pas être initialisée." />;
  }

  if (status === 'authenticated' && !isPasswordRecovery && !isCallbackRoute) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
