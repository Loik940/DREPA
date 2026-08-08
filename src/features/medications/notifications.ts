// Notifications locales génériques : aucune information de traitement ou dosage n’est exposée.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'medication-reminders';

export class NotificationPermissionError extends Error {}

// Notifications génériques : elles n’exposent aucun traitement et servent seulement à l’organisation des rappels.
export async function ensureMedicationNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Rappels de traitements',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new NotificationPermissionError('Les notifications ne sont pas autorisées.');
}

// Un rappel planifié ne garantit pas que le traitement a été pris et ne remplace aucune consigne médicale.
export async function scheduleMedicationReminder(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Rappel DRÉPA', body: 'Un rappel de traitement est prévu.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, channelId: CHANNEL_ID, hour, minute },
  });
}

export async function cancelMedicationReminder(notificationId: string | null) {
  if (notificationId) await Notifications.cancelScheduledNotificationAsync(notificationId);
}
