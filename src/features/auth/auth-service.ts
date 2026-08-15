// Service Auth : encapsule les opérations Supabase d’inscription, connexion et récupération PKCE.
import { supabase } from '@/lib/supabase';
import { secureStorage } from '@/services/secure-storage';

export const authCallbackUrl = 'drepa://auth/callback';
export const passwordResetUrl = authCallbackUrl;
const PASSWORD_RECOVERY_INTENT_KEY = '@drepa/password-recovery-intent';
const PASSWORD_RECOVERY_INTENT_MAX_AGE_MS = 15 * 60 * 1000;

export class AuthOperationError extends Error {
  constructor(message = 'Une erreur est survenue. Réessayez plus tard.') {
    super(message);
    this.name = 'AuthOperationError';
  }
}

function requireSupabase() {
  if (!supabase) {
    throw new AuthOperationError('La configuration de l’authentification est indisponible.');
  }

  return supabase;
}

// Les détails techniques de Supabase ne remontent pas dans l'interface afin de ne pas exposer d'information sensible.
function toAuthOperationError(error: unknown) {
  if (error instanceof AuthOperationError) {
    return error;
  }

  return new AuthOperationError();
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await requireSupabase().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: authCallbackUrl },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function signOut() {
  try {
    const { error } = await requireSupabase().auth.signOut();

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function deleteAccount(email: string, password: string) {
  try {
    const { error: reauthenticationError } = await requireSupabase().auth.signInWithPassword({ email, password });
    if (reauthenticationError) throw reauthenticationError;
    // La suppression est confiée à la fonction sécurisée qui contrôle la session côté serveur.
    const { error } = await requireSupabase().functions.invoke('delete-account', { body: {} });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await secureStorage.setItem(PASSWORD_RECOVERY_INTENT_KEY, String(Date.now()));
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo: passwordResetUrl });

    if (error) {
      throw error;
    }
  } catch (error) {
    await secureStorage.removeItem(PASSWORD_RECOVERY_INTENT_KEY).catch(() => undefined);
    throw toAuthOperationError(error);
  }
}

export async function consumePasswordRecoveryIntent() {
  const intent = await secureStorage.getItem(PASSWORD_RECOVERY_INTENT_KEY);
  await secureStorage.removeItem(PASSWORD_RECOVERY_INTENT_KEY);
  const createdAt = Number(intent);
  return Number.isFinite(createdAt) && Date.now() - createdAt <= PASSWORD_RECOVERY_INTENT_MAX_AGE_MS;
}

export async function updatePassword(password: string) {
  try {
    const { error } = await requireSupabase().auth.updateUser({ password });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw toAuthOperationError(error);
  }
}
