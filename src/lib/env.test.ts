// Tests de la validation des environnements publics sans utiliser de valeur réelle du projet.
import { envSchema } from './env';

function buildLegacyKey(role: string, ref = 'project-ref', exp = Math.floor(Date.now() / 1000) + 3600) {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role, ref, exp })}.synthetic-signature`;
}

const testKey = buildLegacyKey('anon');

describe('public environment validation', () => {
  it('requires HTTPS in preview and production', () => {
    expect(envSchema.safeParse({
      EXPO_PUBLIC_SUPABASE_URL: 'http://example.invalid',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: buildLegacyKey('anon', '127'),
      EXPO_PUBLIC_APP_ENV: 'preview',
    }).success).toBe(false);
  });

  it('allows HTTP only for local development', () => {
    expect(envSchema.safeParse({
      EXPO_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: buildLegacyKey('anon', '127'),
      EXPO_PUBLIC_APP_ENV: 'development',
    }).success).toBe(true);
  });

  it('refuses privileged, expired and malformed client keys', () => {
    const base = { EXPO_PUBLIC_SUPABASE_URL: 'https://project-ref.supabase.co', EXPO_PUBLIC_APP_ENV: 'preview' };
    expect(envSchema.safeParse({ ...base, EXPO_PUBLIC_SUPABASE_ANON_KEY: buildLegacyKey('service_role') }).success).toBe(false);
    expect(envSchema.safeParse({ ...base, EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_secret_never_bundle_this_value' }).success).toBe(false);
    expect(envSchema.safeParse({ ...base, EXPO_PUBLIC_SUPABASE_ANON_KEY: buildLegacyKey('anon', 'project-ref', 1) }).success).toBe(false);
    expect(envSchema.safeParse({ ...base, EXPO_PUBLIC_SUPABASE_ANON_KEY: 'not-a-key-but-long-enough' }).success).toBe(false);
  });

  it('accepts publishable and matching legacy anon keys', () => {
    const base = { EXPO_PUBLIC_SUPABASE_URL: 'https://project-ref.supabase.co', EXPO_PUBLIC_APP_ENV: 'production' };
    expect(envSchema.safeParse({ ...base, EXPO_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_abcdefghijklmnop' }).success).toBe(true);
    expect(envSchema.safeParse({ ...base, EXPO_PUBLIC_SUPABASE_ANON_KEY: testKey }).success).toBe(true);
  });
});
