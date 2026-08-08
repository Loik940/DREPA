// Layout racine : monte les providers globaux et la pile de navigation Expo Router.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { configureMedicationNotificationPresentation } from '@/features/medications/notifications';
import { AppProvider } from '@/providers/app-provider';

// Les notifications locales restent visibles et audibles lorsque l’application est au premier plan.
configureMedicationNotificationPresentation();

export default function RootLayout() {
  // Le rendu principal installe les services globaux avant la navigation.
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
