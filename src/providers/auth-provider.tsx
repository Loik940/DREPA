// Provider Auth : restaure la session, écoute ses changements et expose les actions Supabase Auth.
import type { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import {
  requestPasswordReset,
  reauthenticateForAccountDeletion,
  signIn,
  signOut,
  signUp,
  invokeDeleteAccount,
  updatePassword,
} from '@/features/auth/auth-service';
import { cancelAllDrepaNotifications } from '@/features/medications/notifications';
import { setActiveMedicationOwner } from '@/features/medications/operation-lock';
import { invalidatePrivateQueries, removePrivateQueries } from '@/lib/query-client';
import { supabase } from '../lib/supabase';

// Ces états distinguent clairement la restauration, la présence, l’absence et l’échec de session.
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

// Le contexte rassemble l’état de session et les seules actions d’authentification exposées aux écrans.
type AuthContextValue = {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  isInitializing: boolean;
  sessionReady: boolean;
  isPasswordRecovery: boolean;
  error: string | null;
  signUp: typeof signUp;
  signIn: typeof signIn;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  requestPasswordReset: typeof requestPasswordReset;
  updatePassword: typeof updatePassword;
  clearPasswordRecovery: () => void;
  beginPasswordRecovery: () => void;
  clearError: () => void;
  canRetrySessionRestore: boolean;
  retrySessionRestore: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_INITIALIZATION_TIMEOUT_MS = 5_000;

export function AuthProvider({ children }: PropsWithChildren) {
  // Ces états représentent la session courante, la fin de son initialisation et la récupération de mot de passe.
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'error');
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [initializationAttempt, setInitializationAttempt] = useState(0);
  const [error, setError] = useState<string | null>(
    supabase ? null : 'La configuration de l’authentification est indisponible.',
  );

  // Cet effet restaure la session, écoute les événements Supabase et suit le cycle de vie mobile.
  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    let mounted = true;
    let initializationComplete = false;
    let authEventReceived = false;
    let authFallbackAvailable = false;
    let initializationFailed = false;
    let initializationTimedOut = false;
    let latestSession: Session | null = null;
    let activeUserId: string | null = null;

    // Un changement de compte purge d’abord le cache privé de l’utilisateur précédent.
    const applySession = (nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null;
      setActiveMedicationOwner(nextUserId);

      if (activeUserId && activeUserId !== nextUserId) {
        removePrivateQueries(activeUserId);
        void cancelAllDrepaNotifications().catch(() => undefined);
      }

      activeUserId = nextUserId;
      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
      setError(null);
    };

    // Les événements reçus maintiennent la session, la récupération et le cache privé synchronisés.
    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) {
        return;
      }

      // Un événement initial nul arrivé après un échec ne doit pas transformer cet échec en simple déconnexion.
      if (initializationFailed && event === 'INITIAL_SESSION' && !nextSession) {
        return;
      }

      authEventReceived = true;
      authFallbackAvailable = Boolean(nextSession) || event === 'SIGNED_OUT';
      latestSession = nextSession;

      if (initializationComplete) {
        applySession(nextSession);
      }

      if (event === 'SIGNED_IN' && nextSession) {
        void invalidatePrivateQueries(nextSession.user.id);
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
        removePrivateQueries();
        void cancelAllDrepaNotifications().catch(() => undefined);
      }
    });

    // Un délai borné empêche une lecture SecureStore bloquée de conserver le splash indéfiniment.
    const initializationTimeout = setTimeout(() => {
      if (!mounted || initializationComplete) return;
      initializationTimedOut = true;
      initializationComplete = true;

      if (authFallbackAvailable) {
        applySession(latestSession);
        setSessionReady(true);
        return;
      }

      setSession(null);
      initializationFailed = true;
      setStatus('error');
      setError('La session ne peut pas être restaurée.');
      setSessionReady(true);
    }, AUTH_INITIALIZATION_TIMEOUT_MS);

    // La lecture initiale attend la session persistée sans écraser un événement reçu entre-temps.
    void client.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (!mounted || initializationTimedOut) {
        return;
      }

      clearTimeout(initializationTimeout);
      initializationComplete = true;

      if (sessionError) {
        if (authFallbackAvailable) {
          applySession(latestSession);
        } else {
          setSession(null);
          initializationFailed = true;
          setStatus('error');
          setError('La session ne peut pas être restaurée.');
        }
        setSessionReady(true);
        return;
      }

      const restoredSession = authEventReceived ? latestSession : sessionData.session;
      applySession(restoredSession);
      setSessionReady(true);

      if (restoredSession) {
        void invalidatePrivateQueries(restoredSession.user.id);
      }
    }).catch(() => {
      if (!mounted || initializationTimedOut) return;
      clearTimeout(initializationTimeout);
      initializationComplete = true;

      if (authFallbackAvailable) {
        applySession(latestSession);
      } else {
        setSession(null);
        initializationFailed = true;
        setStatus('error');
        setError('La session ne peut pas être restaurée.');
      }
      setSessionReady(true);
    });

    // Le rafraîchissement automatique ne reste actif que lorsque l’application est au premier plan.
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void client.auth.startAutoRefresh();
      } else {
        void client.auth.stopAutoRefresh();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(initializationTimeout);
      data.subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, [initializationAttempt]);

  // La déconnexion et la suppression de compte terminent aussi la présence des données privées en cache.
  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      await supabase?.auth.signOut({ scope: 'local' }).catch(() => undefined);
      try {
        await cancelAllDrepaNotifications();
      } catch {
        // Le nettoyage Auth local reste prioritaire ; une prochaine ouverture retentera la suspension.
      }
      setSession(null);
      setStatus('unauthenticated');
      removePrivateQueries();
    }
  };

  const handleDeleteAccount = async (password: string) => {
    const email = session?.user.email;
    if (!email) throw new Error('Account email is unavailable.');
    await reauthenticateForAccountDeletion(email, password);
    try {
      await invokeDeleteAccount();
    } finally {
      await supabase?.auth.signOut({ scope: 'local' }).catch(() => undefined);
      await cancelAllDrepaNotifications().catch(() => undefined);
      setSession(null);
      setStatus('unauthenticated');
      removePrivateQueries();
    }
  };

  // Cette valeur forme l’API stable du provider pour ses composants descendants.
  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    status,
    isInitializing: !sessionReady,
    sessionReady,
    isPasswordRecovery,
    error,
    signUp,
    signIn,
    signOut: handleSignOut,
    deleteAccount: handleDeleteAccount,
    requestPasswordReset,
    updatePassword,
    clearPasswordRecovery: () => setIsPasswordRecovery(false),
    beginPasswordRecovery: () => setIsPasswordRecovery(true),
    clearError: () => setError(null),
    canRetrySessionRestore: Boolean(supabase),
    retrySessionRestore: () => {
      setSession(null);
      setStatus(supabase ? 'loading' : 'error');
      setError(supabase ? null : 'La configuration de l’authentification est indisponible.');
      setSessionReady(!supabase);
      if (supabase) setInitializationAttempt((attempt) => attempt + 1);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Le hook refuse un usage hors provider afin d’éviter un état d’authentification implicite.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
