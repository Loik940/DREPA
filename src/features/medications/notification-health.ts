// État local de livraison des rappels : partagé entre la réconciliation et les écrans sans donnée médicale.
// Il distingue la configuration souhaitée de la capacité Android réellement vérifiée sur cet appareil.
import { useSyncExternalStore } from 'react';

export type NotificationHealth = 'unknown' | 'checking' | 'scheduled' | 'permission-denied' | 'error';

let currentHealth: NotificationHealth = 'unknown';
const listeners = new Set<() => void>();

export function setMedicationNotificationHealth(health: NotificationHealth) {
  currentHealth = health;
  listeners.forEach((listener) => listener());
}

export function useMedicationNotificationHealth() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentHealth,
    () => 'unknown',
  );
}
