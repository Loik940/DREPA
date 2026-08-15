// Layout protégé : vérifie la session puis impose l’ordre consentements, profil et onglets.
import { Redirect, Stack, useSegments } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useMedicationNotificationReconciliation } from '@/features/medications/reconciliation';
import type { ProfileDataError } from '@/features/profile/completion';
import { useOnboardingStatus } from '@/features/profile/use-onboarding-status';
import { env } from '@/lib/env';
import { useAuth } from '@/providers/auth-provider';
import { colors } from '@/theme/colors';

export default function ProtectedLayout() {
  usePreventScreenCapture('drepa-protected-space');
  // Les hooks lisent la session, l’onboarding et la route protégée courante.
  const { canRetrySessionRestore, retrySessionRestore, session, sessionReady, status } = useAuth();
  const onboarding = useOnboardingStatus();
  useMedicationNotificationReconciliation(session?.user.id, onboarding.status === 'complete');
  const segments = useSegments() as string[];
  const isConsentRoute = segments.includes('consent');
  const isCompleteProfileRoute = segments.includes('complete-profile');

  // Les états de chargement et d’erreur bloquent la navigation protégée.
  if (!sessionReady || status === 'loading') {
    return <ScreenPlaceholder loading title="Chargement" description="Restauration de la session." />;
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

  // Une session absente renvoie vers la connexion.
  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  // Le profil et les consentements doivent être chargés avant de poursuivre.
  if (onboarding.status === 'loading') {
    return <ScreenPlaceholder loading title="Chargement" description="Lecture du profil et des consentements." />;
  }

  if (onboarding.status === 'error') {
    return (
      <DataErrorScreen error={onboarding.error} onRetry={() => void onboarding.retry()} />
    );
  }

  // Les redirections imposent chaque étape incomplète dans le bon ordre.
  if (onboarding.status === 'needs-consent' && !isConsentRoute) {
    return <Redirect href="/(app)/consent" />;
  }

  if (onboarding.status === 'needs-profile' && !isCompleteProfileRoute && !isConsentRoute) {
    return <Redirect href="/(app)/complete-profile" />;
  }

  if (onboarding.status === 'complete' && (isConsentRoute || isCompleteProfileRoute)) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  // Le rendu principal expose la pile protégée lorsque tous les contrôles passent.
  return (
    <Stack screenOptions={{
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.backgroundPrimary },
      headerTintColor: colors.brand,
      headerTitle: '',
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="consent" options={{ headerShown: false }} />
      <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}

function DataErrorScreen({ error, onRetry }: { error: ProfileDataError | null; onRetry: () => void }) {
  const showDiagnostic = __DEV__ && env?.EXPO_PUBLIC_APP_ENV === 'development' && error;

  // Le rendu d’erreur garde le diagnostic technique réservé au développement.
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
