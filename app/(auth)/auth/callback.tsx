// Callback de confirmation : échange les paramètres du deep link contre la session Supabase.
import 'react-native-url-polyfill/auto';

import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { supabase } from '@/lib/supabase';

function parseAuthParams(url: string) {
  const fragment = url.split('#')[1] ?? url.split('?')[1] ?? '';
  return new URLSearchParams(fragment);
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const handledUrl = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url || handledUrl.current === url) {
        return;
      }

      handledUrl.current = url;

      if (!supabase) {
        setError('La configuration de l’authentification est indisponible.');
        return;
      }

      const params = parseAuthParams(url);
      const errorDescription = params.get('error_description');
      const code = params.get('code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (errorDescription) {
        setError('La confirmation de l’adresse e-mail a échoué.');
        return;
      }

      const result = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : accessToken && refreshToken
          ? await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          : { error: new Error('Missing authentication parameters') };

      if (result.error) {
        setError('La confirmation de l’adresse e-mail a échoué.');
        return;
      }

      router.replace('/');
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => void handleUrl(url));

    return () => subscription.remove();
  }, [router]);

  if (error) {
    return <ScreenPlaceholder title="Confirmation impossible" description={error} actionLabel="Retour à la connexion" onAction={() => router.replace('/(auth)/login')} />;
  }

  return <ScreenPlaceholder title="Confirmation en cours" description="Nous vérifions ton adresse e-mail." />;
}
