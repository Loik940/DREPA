// Layout racine : monte les providers globaux et la pile de navigation Expo Router.
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { configureMedicationNotificationPresentation } from '@/features/medications/notifications';
import { AppProvider } from '@/providers/app-provider';
import { useAuth } from '@/providers/auth-provider';
import { useStartup } from '@/providers/startup-provider';

// Les notifications locales restent visibles et audibles lorsque l’application est au premier plan.
configureMedicationNotificationPresentation();

// Le splash natif reste visible pendant la restauration réelle de la session.
// L'appel au niveau du module intervient avant le premier rendu React et évite un double chargement visible.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const { sessionReady, status } = useAuth();
  const { startupReady } = useStartup();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  });
  const ready = sessionReady && status !== 'loading' && startupReady && (fontsLoaded || Boolean(fontError));

  // Auth et la préférence de bienvenue sont prêtes ensemble avant de céder la place à la navigation.
  useEffect(() => {
    if (!ready) return undefined;

    let attempt = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const hide = () => {
      try {
        SplashScreen.hide();
      } catch {
        attempt += 1;
        if (attempt < 3) retry = setTimeout(hide, 100);
      }
    };

    hide();
    return () => clearTimeout(retry);
  }, [ready]);

  useEffect(() => {
    const openResponse = (response: Notifications.NotificationResponse | null) => {
      if (response?.notification.request.content.data?.route === 'medications') {
        router.push('/(app)/(tabs)/medications');
        void Notifications.clearLastNotificationResponseAsync();
      }
    };
    const subscription = Notifications.addNotificationResponseReceivedListener(openResponse);
    void Notifications.getLastNotificationResponseAsync().then(openResponse);
    return () => subscription.remove();
  }, [router]);

  return (
    <>
      <StatusBar style={ready ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
