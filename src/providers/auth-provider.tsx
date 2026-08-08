// Provider Auth : restaure la session, écoute ses changements et expose les actions Supabase Auth.
import type { Session, User } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import {
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  deleteAccount,
  updatePassword,
} from '@/features/auth/auth-service';
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
  deleteAccount: () => Promise<void>;
  requestPasswordReset: typeof requestPasswordReset;
  updatePassword: typeof updatePassword;
  clearPasswordRecovery: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  // Ces états représentent la session courante, la fin de son initialisation et la récupération de mot de passe.
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'error');
  const [sessionReady, setSessionReady] = useState(!supabase);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
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
    let latestSession: Session | null = null;
    let activeUserId: string | null = null;

    // Un changement de compte purge d’abord le cache privé de l’utilisateur précédent.
    const applySession = (nextSession: Session | null) => {
      const nextUserId = nextSession?.user.id ?? null;

      if (activeUserId && activeUserId !== nextUserId) {
        removePrivateQueries(activeUserId);
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

      authEventReceived = true;
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
      }
    });

    // La lecture initiale attend la session persistée sans écraser un événement reçu entre-temps.
    void client.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
      if (!mounted) {
        return;
      }

      initializationComplete = true;

      if (sessionError && !authEventReceived) {
        setSession(null);
        setStatus('error');
        setError('La session ne peut pas être restaurée.');
        setSessionReady(true);
        return;
      }

      const restoredSession = authEventReceived ? latestSession : sessionData.session;
      applySession(restoredSession);
      setSessionReady(true);

      if (restoredSession) {
        void invalidatePrivateQueries(restoredSession.user.id);
      }
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
      data.subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  // La déconnexion et la suppression de compte terminent aussi la présence des données privées en cache.
  const handleSignOut = async () => {
    await signOut();
    removePrivateQueries();
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    await signOut();
    removePrivateQueries();
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
    clearError: () => setError(null),
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
