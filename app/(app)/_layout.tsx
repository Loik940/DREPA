// Layout protégé : vérifie la session puis impose l’ordre consentements, profil et onglets.
import { Redirect, Stack, useRouter, useSegments } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import type { ProfileDataError } from '@/features/profile/completion';
import { useOnboardingStatus } from '@/features/profile/use-onboarding-status';
import { env } from '@/lib/env';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedLayout() {
  const router = useRouter();
  const { session, sessionReady, status } = useAuth();
  const onboarding = useOnboardingStatus();
  const segments = useSegments() as string[];
  const isConsentRoute = segments.includes('consent');
  const isCompleteProfileRoute = segments.includes('complete-profile');

  if (!sessionReady || status === 'loading') {
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

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (onboarding.status === 'loading') {
    return <ScreenPlaceholder title="Chargement" description="Lecture du profil et des consentements." />;
  }

  if (onboarding.status === 'error') {
    return (
      <DataErrorScreen error={onboarding.error} onRetry={() => void onboarding.retry()} />
    );
  }

  if (onboarding.status === 'needs-consent' && !isConsentRoute) {
    return <Redirect href="/(app)/consent" />;
  }

  if (onboarding.status === 'needs-profile' && !isCompleteProfileRoute && !isConsentRoute) {
    return <Redirect href="/(app)/complete-profile" />;
  }

  if (onboarding.status === 'complete' && (isConsentRoute || isCompleteProfileRoute)) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

function DataErrorScreen({ error, onRetry }: { error: ProfileDataError | null; onRetry: () => void }) {
  const showDiagnostic = env?.EXPO_PUBLIC_APP_ENV === 'development' && error;

  return (
    <View style={styles.errorScreen}>
      <ScreenPlaceholder
        title="Données indisponibles"
        description={error?.message ?? 'Impossible de charger les informations du compte.'}
        actionLabel="Réessayer"
        onAction={onRetry}
      />
      {showDiagnostic && (
        <View style={styles.diagnosticPanel}>
          <Text style={styles.diagnosticTitle}>Diagnostic développement</Text>
          <Text>Source : {error.source}</Text>
          <Text>Type : {error.kind}</Text>
          {error.technical.code && <Text>Code : {error.technical.code}</Text>}
          {error.technical.status && <Text>Statut HTTP : {error.technical.status}</Text>}
          {error.technical.message && <Text>Message : {error.technical.message}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1 },
  diagnosticPanel: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    gap: 4,
    margin: 16,
    padding: 12,
  },
  diagnosticTitle: { fontWeight: '700' },
});
