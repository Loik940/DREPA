import { Redirect, useRouter } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const router = useRouter();
  const { session, status } = useAuth();

  if (status === 'loading') {
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

  return session ? <Redirect href="/(app)/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
