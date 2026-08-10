// Notifications locales génériques : aucune information de traitement ou dosage n’est exposée.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Rappels de traitements',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
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

export async function cancelMedicationReminder(notificationId: string | null) {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
