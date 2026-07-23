import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return session ? <Redirect href="/(app)/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
