import { Redirect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export const WELCOME_SEEN_KEY = '@drepa/welcome-seen';

export default function HomeScreen() {
  const router = useRouter();
  const { session, sessionReady, status } = useAuth();
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

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

  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return welcomeSeen ? <Redirect href="/(auth)/login" /> : <Redirect href="/(auth)/welcome" />;
}
