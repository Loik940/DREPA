// Route d’entrée : affiche l’accueil initial puis oriente selon l’onboarding et la session.
import { Redirect } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { BrandedSplashScreen } from '@/components/ui/BrandedSplashScreen';
import { useAuth } from '@/providers/auth-provider';
import { useStartup } from '@/providers/startup-provider';

export default function HomeScreen() {
  // Les hooks préparent la navigation, la session et l’état local de bienvenue.
  const { canRetrySessionRestore, retrySessionRestore, session, sessionReady, status } = useAuth();
  const { startupReady, welcomeSeen } = useStartup();

  // Les états de chargement et d’erreur bloquent toute redirection prématurée.
  if (!sessionReady || status === 'loading' || !startupReady) {
    return <BrandedSplashScreen />;
  }

  if (status === 'error') {
    return (
      <ScreenPlaceholder
        accessibilityRole="alert"
        title="Session indisponible"
        description="La connexion sécurisée ne peut pas être restaurée pour le moment."
        actionLabel={canRetrySessionRestore ? 'Réessayer' : undefined}
        onAction={canRetrySessionRestore ? retrySessionRestore : undefined}
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
