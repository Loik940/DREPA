// Tests de la validation des environnements publics sans utiliser de valeur réelle du projet.
import { envSchema } from './env';

const testKey = ['public', 'test', 'key', 'long', 'enough'].join('-');

describe('public environment validation', () => {
  it('requires HTTPS in preview and production', () => {
    expect(envSchema.safeParse({
      EXPO_PUBLIC_SUPABASE_URL: 'http://example.invalid',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: testKey,
      EXPO_PUBLIC_APP_ENV: 'preview',
    }).success).toBe(false);
  });

  it('allows HTTP only for local development', () => {
    expect(envSchema.safeParse({
      EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: testKey,
      EXPO_PUBLIC_APP_ENV: 'development',
    }).success).toBe(true);
  });
});
