// Provider de démarrage : charge une seule fois la préférence locale de bienvenue avant de masquer le splash natif.
// Cette préférence n’est pas sensible et reste dans AsyncStorage ; un délai borné évite de bloquer l’application.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { retryPendingNotificationCleanup } from '@/features/medications/notifications';

export const WELCOME_SEEN_KEY = '@drepa/welcome-seen';

type StartupContextValue = {
  startupReady: boolean;
  welcomeSeen: boolean;
  markWelcomeSeen: () => Promise<void>;
};

const STARTUP_STORAGE_TIMEOUT_MS = 3_000;
const StartupContext = createContext<StartupContextValue | undefined>(undefined);

export function StartupProvider({ children }: PropsWithChildren) {
  const [startupReady, setStartupReady] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);

  useEffect(() => {
    let active = true;
    let settled = false;

    const finish = (seen: boolean) => {
      if (!active || settled) return;
      settled = true;
      setWelcomeSeen(seen);
      setStartupReady(true);
    };
    const timeout = setTimeout(() => finish(false), STARTUP_STORAGE_TIMEOUT_MS);

    void Promise.allSettled([
      AsyncStorage.getItem(WELCOME_SEEN_KEY),
      retryPendingNotificationCleanup(),
    ])
      .then(([welcomeResult]) => finish(welcomeResult.status === 'fulfilled' && welcomeResult.value === 'true'))
      .catch(() => finish(false))
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  // La mémoire courante est mise à jour avant l’écriture afin que la navigation ne revienne pas à la bienvenue.
  const markWelcomeSeen = async () => {
    setWelcomeSeen(true);
    try {
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
    } catch {
      // La navigation courante continue ; une nouvelle ouverture reproposera la bienvenue si le stockage reste indisponible.
    }
  };

  return (
    <StartupContext.Provider value={{ startupReady, welcomeSeen, markWelcomeSeen }}>
      {children}
    </StartupContext.Provider>
  );
}

export function useStartup() {
  const context = useContext(StartupContext);
  if (!context) throw new Error('useStartup must be used inside StartupProvider');
  return context;
}
