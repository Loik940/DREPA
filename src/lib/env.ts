// Validation des variables publiques d’environnement nécessaires au client Supabase.
import { z } from 'zod';

function decodeLegacyJwtPayload(key: string) {
  try {
    const part = key.split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    return JSON.parse(atob(normalized)) as { role?: string; ref?: string; exp?: number };
  } catch {
    return null;
  }
}

export function isValidPublicSupabaseKey(key: string, urlValue: string) {
  const normalizedKey = key.trim();
  if (/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(normalizedKey)) return true;
  if (normalizedKey.startsWith('sb_secret_') || normalizedKey.toLowerCase().includes('service_role')) return false;
  const payload = decodeLegacyJwtPayload(normalizedKey);
  if (!payload || payload.role !== 'anon') return false;
  if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) return false;
  try {
    const projectRef = new URL(urlValue).hostname.split('.')[0];
    return !payload.ref || payload.ref === projectRef;
  } catch {
    return false;
  }
}

// Le schéma accepte uniquement les variables publiques attendues et les environnements connus.
export const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
}).superRefine((values, context) => {
  const url = new URL(values.EXPO_PUBLIC_SUPABASE_URL);
  const localHost = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (values.EXPO_PUBLIC_APP_ENV === 'development') {
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && localHost)) {
      context.addIssue({ code: 'custom', path: ['EXPO_PUBLIC_SUPABASE_URL'], message: 'HTTP est réservé au Supabase local.' });
    }
  } else if (url.protocol !== 'https:') {
    context.addIssue({ code: 'custom', path: ['EXPO_PUBLIC_SUPABASE_URL'], message: 'Supabase doit utiliser HTTPS hors développement.' });
  }
  if (!isValidPublicSupabaseKey(values.EXPO_PUBLIC_SUPABASE_ANON_KEY, values.EXPO_PUBLIC_SUPABASE_URL)) {
    context.addIssue({ code: 'custom', path: ['EXPO_PUBLIC_SUPABASE_ANON_KEY'], message: 'La clé Supabase publique est invalide ou privilégiée.' });
  }
});

// La validation est faite une seule fois au chargement pour empêcher la création d’un client mal configuré.
export const envResult = envSchema.safeParse({
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
});

// Une configuration invalide reste explicite avec une valeur nulle au lieu d’être utilisée partiellement.
export const env = envResult.success ? envResult.data : null;
