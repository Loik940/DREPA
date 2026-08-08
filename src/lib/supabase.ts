// Singleton Supabase typé avec persistance SecureStore et session mobile protégée.
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import { env } from './env';
import { secureStorage } from '../services/secure-storage';
import type { Database } from '../types/database.types';

// Le client unique utilise les types de la base et confie la session mobile au stockage sécurisé.
// Le rafraîchissement suit l’état de l’application, sans chercher de session dans une URL mobile.
export const supabase = env
  ? createClient<Database>(env.EXPO_PUBLIC_SUPABASE_URL, env.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
