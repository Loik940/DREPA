// Route d’entrée : affiche l’accueil initial puis oriente selon l’onboarding et la session.
import { Redirect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export const WELCOME_SEEN_KEY = '@drepa/welcome-seen';

export default function HomeScreen() {
  // Les hooks préparent la navigation, la session et l’état local de bienvenue.
  const router = useRouter();
  const { session, sessionReady, status } = useAuth();
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  // La préférence locale est chargée avant de choisir le premier écran public.
  useEffect(() => {
    let mounted = true;

    void AsyncStorage.getItem(WELCOME_SEEN_KEY)
      .then((value) => {
        if (mounted) {
          setWelcomeSeen(value === 'true');
        }
      })
      .catch(() => {
        if (mounted) {
          setWelcomeSeen(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Les états de chargement et d’erreur bloquent toute redirection prématurée.
  if (!sessionReady || status === 'loading' || (!session && welcomeSeen === null)) {
    return <ScreenPlaceholder title="Chargement" description="Restauration de la session." />;
  }

  if (status === 'error') {
    return (
      <ScreenPlaceholder
        title="Configuration indisponible"
        description="La connexion sécurisée ne peut pas être initialisée."
        actionLabel="Réessayer"
        onAction={() => router.replace('/')}
      />
    );
  }

  // Une session valide ouvre directement l’espace protégé.
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  // Sans session, la redirection dépend de la consultation de la bienvenue.
  return welcomeSeen ? <Redirect href="/(auth)/login" /> : <Redirect href="/(auth)/welcome" />;
}
