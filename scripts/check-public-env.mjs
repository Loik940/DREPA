// Ce preflight valide uniquement les variables publiques et n’affiche jamais leur valeur.
import { Buffer } from 'node:buffer';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // EAS fournit directement les variables ; le fichier local reste optionnel.
  }
}

const expectedArgument = process.argv.find((argument) => argument.startsWith('--expected='));
const expectedEnvironment = expectedArgument?.split('=')[1];
const urlValue = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
const appEnvironment = process.env.EXPO_PUBLIC_APP_ENV ?? '';
const errors = [];

let url;
try {
  url = new URL(urlValue);
} catch {
  errors.push('EXPO_PUBLIC_SUPABASE_URL');
}

if (url && appEnvironment !== 'development' && url.protocol !== 'https:') errors.push('EXPO_PUBLIC_SUPABASE_URL');
if (expectedEnvironment && appEnvironment !== expectedEnvironment) errors.push('EXPO_PUBLIC_APP_ENV');

const publishable = /^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(key);
let legacyAnon = false;
if (!publishable && !key.startsWith('sb_secret_')) {
  try {
    const part = key.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const payload = JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
    const projectRef = url?.hostname.split('.')[0];
    legacyAnon = payload.role === 'anon'
      && (!payload.exp || payload.exp > Math.floor(Date.now() / 1000))
      && (!payload.ref || payload.ref === projectRef);
  } catch {
    legacyAnon = false;
  }
}
if (!publishable && !legacyAnon) errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');

if (errors.length) {
  console.error(`Configuration publique invalide: ${[...new Set(errors)].join(', ')}`);
  process.exit(1);
}

console.log(`Configuration publique ${appEnvironment} valide.`);
