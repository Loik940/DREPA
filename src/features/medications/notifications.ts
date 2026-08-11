// Notifications locales génériques : aucune information de traitement ou dosage n’est exposée.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NotificationCancellationError, uniqueNotificationIds } from './notification-ids';

export { NotificationCancellationError } from './notification-ids';

const CHANNEL_ID = 'medication-reminders';

export class NotificationPermissionError extends Error {}

export function configureMedicationNotificationPresentation() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Notifications génériques : elles n’exposent aucun traitement et servent seulement à l’organisation des rappels.
export async function ensureMedicationNotificationPermission() {
  if (Platform.OS === 'android') {
    const existing = await Notifications.getNotificationChannelAsync(CHANNEL_ID);
    // Migration unique : supprime l’ancien canal qui cherchait un fichier audio personnalisé incorrect.
    if (existing?.sound === 'custom') {
      await Notifications.deleteNotificationChannelAsync(CHANNEL_ID);
    }

    // Sans propriété sound, Android utilise le son système et Expo ne cherche aucun fichier personnalisé.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Rappels de traitements',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new NotificationPermissionError('Les notifications ne sont pas autorisées.');
}

// Un rappel planifié ne garantit pas que le traitement a été pris et ne remplace aucune consigne médicale.
// Le booléen utilise le son du canal et évite qu’Expo cherche un fichier personnalisé nommé default.
export async function scheduleMedicationReminder(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Rappel DRÉPA', body: 'Vous avez un rappel dans DRÉPA.', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, channelId: CHANNEL_ID, hour, minute },
  });
}

// Ce test local reste générique et ne reprend aucune information médicale saisie.
export async function scheduleMedicationReminderTest() {
  await ensureMedicationNotificationPermission();
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Test DRÉPA', body: 'Les notifications DRÉPA fonctionnent sur cet appareil.', sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, channelId: CHANNEL_ID, seconds: 10 },
  });
}

// Le report programme un message générique et ne reprend aucune donnée de traitement.
export async function scheduleMedicationSnooze(minutes = 10) {
  await ensureMedicationNotificationPermission();
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Rappel DRÉPA', body: 'Vous avez un rappel dans DRÉPA.', sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: CHANNEL_ID,
      seconds: minutes * 60,
    },
  });
}

// L’ordre séquentiel permet de connaître exactement les identifiants annulés avant un éventuel échec.
export async function cancelNotificationIds(ids: readonly (string | null | undefined)[]) {
  const cancelledIds: string[] = [];
  for (const id of uniqueNotificationIds(ids)) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      cancelledIds.push(id);
    } catch (cause) {
      throw new NotificationCancellationError(cancelledIds, cause);
    }
  }
  return cancelledIds;
}
