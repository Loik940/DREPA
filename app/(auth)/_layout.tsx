// Layout public : protège les écrans d’authentification et laisse passer la récupération de session.
import { Redirect, Stack, useSegments } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export default function AuthLayout() {
  // Les hooks lisent l’état d’authentification et la route publique courante.
  const { status, isPasswordRecovery } = useAuth();
  const segments = useSegments() as string[];
  const isCallbackRoute = segments.includes('callback');

  // Le chargement et l’erreur empêchent d’afficher une route au mauvais moment.
  if (status === 'loading') {
    return <ScreenPlaceholder title="Chargement" description="Vérification de la session." />;
  }

  if (status === 'error') {
    return <ScreenPlaceholder title="Configuration indisponible" description="La connexion sécurisée ne peut pas être initialisée." />;
  }

  // Une personne déjà connectée quitte les écrans publics ordinaires.
  if (status === 'authenticated' && !isPasswordRecovery && !isCallbackRoute) {
    return <Redirect href="/" />;
  }

  // Le rendu principal expose la pile des routes d’authentification autorisées.
  return <Stack screenOptions={{ headerShown: false }} />;
}
