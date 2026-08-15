// Callback de confirmation : échange les paramètres du deep link contre la session Supabase.
import 'react-native-url-polyfill/auto';

import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { ScreenPlaceholder } from '@/components/screen-placeholder';
import { parseAuthCallbackUrl } from '@/features/auth/callback';
import { consumePasswordRecoveryIntent } from '@/features/auth/auth-service';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

const CALLBACK_TIMEOUT_MS = 10_000;

export default function AuthCallbackScreen() {
  // Les hooks préparent la navigation, le suivi du lien et l’état d’erreur.
  const router = useRouter();
  const auth = useAuth();
  const incomingUrl = Linking.useURL();
  const handledUrl = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Le lien reçu est vérifié une seule fois puis échangé contre une session.
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

      const { code, errorDescription, validTarget } = parseAuthCallbackUrl(url);

      if (!validTarget || errorDescription || !code) {
        await consumePasswordRecoveryIntent().catch(() => false);
        setError('La confirmation de l’adresse e-mail a échoué.');
        return;
      }

      let recoveryIntent = false;
      try {
        recoveryIntent = await consumePasswordRecoveryIntent();
        // Seul le code PKCE lié au vérificateur conservé dans SecureStore est accepté.
        const result = await supabase.auth.exchangeCodeForSession(code);
        if (result.error) throw result.error;
        const redirectType = (result.data as typeof result.data & { redirectType?: string }).redirectType;
        recoveryIntent = redirectType === 'recovery' || (!redirectType && recoveryIntent);
      } catch {
        setError('La confirmation de l’adresse e-mail a échoué.');
        return;
      }

      if (recoveryIntent) {
        auth.beginPasswordRecovery();
        router.replace('/(auth)/reset-password');
      } else {
        router.replace('/');
      }
    };

    void handleUrl(incomingUrl);
  }, [auth, incomingUrl, router]);

  useEffect(() => {
    if (incomingUrl || error) return undefined;
    const timeout = setTimeout(() => setError('Aucun lien sécurisé valide n’a été reçu.'), CALLBACK_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [error, incomingUrl]);

  // Une erreur de confirmation propose un retour sûr vers la connexion.
  if (error) {
    return <ScreenPlaceholder accessibilityRole="alert" title="Confirmation impossible" description={error} actionLabel="Retour à la connexion" onAction={() => router.replace('/(auth)/login')} />;
  }

  // Le rendu principal indique que la confirmation est encore en cours.
  return <ScreenPlaceholder loading title="Confirmation en cours" description="Nous vérifions ton adresse e-mail." />;
}
