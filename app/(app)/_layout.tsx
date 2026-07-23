import { Redirect, Stack, useSegments } from 'expo-router';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { useOnboardingStatus } from '@/features/profile/use-onboarding-status';
import { useAuth } from '@/providers/auth-provider';

export default function ProtectedLayout() {
  const { session, status } = useAuth();
  const onboarding = useOnboardingStatus();
  const segments = useSegments() as string[];
  const isConsentRoute = segments.includes('consent');
  const isCompleteProfileRoute = segments.includes('complete-profile');

  if (status === 'loading') {
    return <ScreenPlaceholder title="Chargement" description="Restauration de la session." />;
  }

  if (status === 'error' || !session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (onboarding.status === 'loading') {
    return <ScreenPlaceholder title="Chargement" description="Lecture du profil et des consentements." />;
  }

  if (onboarding.status === 'error') {
    return <ScreenPlaceholder title="Profil indisponible" description="Impossible de charger les informations du compte." />;
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
