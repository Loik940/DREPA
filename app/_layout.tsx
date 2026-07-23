import { Stack } from 'expo-router';

import { AppProvider } from '@/providers/app-provider';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProvider>
  );
}
