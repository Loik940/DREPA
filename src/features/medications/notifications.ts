// Notifications locales génériques : aucune information de traitement ou dosage n’est exposée.
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { NotificationCancellationError, uniqueNotificationIds } from './notification-ids';
import { buildMedicationNotificationSchedule, MAX_SCHEDULED_MEDICATION_NOTIFICATIONS } from './notification-schedule';
import { setMedicationNotificationHealth } from './notification-health';
import { assertCurrentMedicationOperation } from './operation-lock';

export { NotificationCancellationError } from './notification-ids';

const CHANNEL_ID = 'medication-reminders';
const CLEANUP_PENDING_KEY = '@drepa/notification-cleanup-pending';
let schedulingQueue: Promise<void> = Promise.resolve();
let schedulingSuspended = false;
let cleanupPromise: Promise<void> | null = null;

export class NotificationPermissionError extends Error {}
export class NotificationSchedulingError extends Error {
  constructor(
    public readonly seriesId: string,
    public readonly time: string,
    public override readonly cause: unknown,
  ) {
    super('La série de notifications n’a pas pu être programmée complètement.');
  }
}

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
    if (existing && (
      existing.sound === 'custom'
      || existing.name !== 'Rappels DRÉPA'
      || existing.lockscreenVisibility !== Notifications.AndroidNotificationVisibility.SECRET
    )) {
      await Notifications.deleteNotificationChannelAsync(CHANNEL_ID);
    }

    // Sans propriété sound, Android utilise le son système et Expo ne cherche aucun fichier personnalisé.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Rappels DRÉPA',
      importance: Notifications.AndroidImportance.HIGH,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.SECRET,
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
export function scheduleMedicationReminder(
  time: string,
  medicationId: string,
  startDate: string,
  endDate: string | null,
) {
  return runWithSchedulingLock(() => scheduleMedicationReminderUnlocked(time, medicationId, startDate, endDate));
}

async function scheduleMedicationReminderUnlocked(
  time: string,
  medicationId: string,
  startDate: string,
  endDate: string | null,
) {
  if (schedulingSuspended) throw new Error('La programmation est suspendue pendant le changement de session.');
  assertCurrentMedicationOperation();
  const schedule = buildMedicationNotificationSchedule(medicationId, time, startDate, endDate);
  const content = { title: 'Rappel DRÉPA', body: 'Vous avez un rappel dans DRÉPA.', data: { route: 'medications' }, sound: true } as const;
  const scheduledIds: string[] = [];
  const requestedCount = schedule.occurrences.length;

  try {
    await ensureNotificationCapacity(requestedCount, schedule.seriesId);
    for (const occurrence of schedule.occurrences) {
      assertCurrentMedicationOperation();
      await Notifications.scheduleNotificationAsync({
        identifier: occurrence.identifier,
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, channelId: CHANNEL_ID, date: occurrence.date },
      });
      scheduledIds.push(occurrence.identifier);
    }
  } catch (error) {
    for (const identifier of scheduledIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      } catch {
        // Le préfixe de série porté par l’erreur permet à la mutation de reprendre ce nettoyage.
      }
    }
    throw new NotificationSchedulingError(schedule.seriesId, time, error);
  }

  return schedule.seriesId;
}

// Ce test local reste générique et ne reprend aucune information médicale saisie.
export async function scheduleMedicationReminderTest() {
  if (schedulingSuspended) throw new Error('La programmation est suspendue pendant le changement de session.');
  await ensureMedicationNotificationPermission();
  return runWithSchedulingLock(async () => {
    if (schedulingSuspended) throw new Error('La programmation est suspendue pendant le changement de session.');
    assertCurrentMedicationOperation();
    await ensureNotificationCapacity(1);
    return Notifications.scheduleNotificationAsync({
      content: { title: 'Test DRÉPA', body: 'Les notifications DRÉPA fonctionnent sur cet appareil.', sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, channelId: CHANNEL_ID, seconds: 10 },
    });
  });
}

// Le report programme un message générique et ne reprend aucune donnée de traitement.
export async function scheduleMedicationSnooze(minutes = 10, identifier?: string) {
  if (schedulingSuspended) throw new Error('La programmation est suspendue pendant le changement de session.');
  await ensureMedicationNotificationPermission();
  const date = new Date(Date.now() + minutes * 60_000);
  return scheduleMedicationSnoozeAt(date, identifier ?? `drepa-snooze:${date.getTime()}`);
}

export function scheduleMedicationSnoozeAt(date: Date, identifier: string) {
  return runWithSchedulingLock(async () => {
    if (schedulingSuspended) throw new Error('La programmation est suspendue pendant le changement de session.');
    assertCurrentMedicationOperation();
    await ensureNotificationCapacity(1, identifier);
    return Notifications.scheduleNotificationAsync({
      identifier,
      content: { title: 'Rappel DRÉPA', body: 'Vous avez un rappel dans DRÉPA.', data: { route: 'medications' }, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        channelId: CHANNEL_ID,
        date,
      },
    });
  });
}

export function buildSnoozeNotificationId(medicationId: string, originalScheduledAt: string, snoozedUntil: string) {
  return `drepa-snooze:${medicationId}:${new Date(originalScheduledAt).getTime()}:${new Date(snoozedUntil).getTime()}`;
}

export function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function hasMedicationNotificationPermission() {
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted;
}

export function cancelAllDrepaNotifications() {
  // Toutes les notifications planifiées appartiennent à cette application Android, y compris les anciens IDs aléatoires.
  schedulingSuspended = true;
  if (cleanupPromise) return cleanupPromise;
  cleanupPromise = (async () => {
    try {
      await AsyncStorage.setItem(CLEANUP_PENDING_KEY, 'true');
      await runWithSchedulingLock(() => Notifications.cancelAllScheduledNotificationsAsync());
      await AsyncStorage.removeItem(CLEANUP_PENDING_KEY);
    } catch (error) {
      await AsyncStorage.setItem(CLEANUP_PENDING_KEY, 'true').catch(() => undefined);
      throw error;
    }
  })().finally(() => {
    cleanupPromise = null;
  });
  return cleanupPromise;
}

export async function resumeMedicationNotificationScheduling() {
  const cleaned = await retryPendingNotificationCleanup();
  if (!cleaned) {
    schedulingSuspended = true;
    setMedicationNotificationHealth('error');
    return false;
  }
  schedulingSuspended = false;
  return true;
}

export async function retryPendingNotificationCleanup() {
  let pending: string | null;
  try {
    pending = await AsyncStorage.getItem(CLEANUP_PENDING_KEY);
  } catch {
    schedulingSuspended = true;
    return false;
  }
  if (pending !== 'true') {
    if (cleanupPromise) await cleanupPromise;
    return true;
  }
  try {
    await cancelAllDrepaNotifications();
    return true;
  } catch {
    schedulingSuspended = true;
    return false;
  }
}

// L’ordre séquentiel permet de connaître exactement les identifiants annulés avant un éventuel échec.
export function cancelNotificationIds(ids: readonly (string | null | undefined)[]) {
  return runWithSchedulingLock(() => cancelNotificationIdsUnlocked(ids));
}

async function cancelNotificationIdsUnlocked(ids: readonly (string | null | undefined)[]) {
  const uniqueIds = uniqueNotificationIds(ids);
  const cancelledIds: string[] = [];
  if (!uniqueIds.length) return cancelledIds;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  for (const id of uniqueIds) {
    const matchingIds = scheduled
      .map((notification) => notification.identifier)
      .filter((identifier) => identifier === id || identifier.startsWith(`${id}:`));

    let cancelledAny = false;
    try {
      for (const matchingId of matchingIds) {
        await Notifications.cancelScheduledNotificationAsync(matchingId);
        cancelledAny = true;
      }
      cancelledIds.push(id);
    } catch (cause) {
      const remaining = await Notifications.getAllScheduledNotificationsAsync();
      const stillScheduled = remaining.some(({ identifier }) => identifier === id || identifier.startsWith(`${id}:`));
      if (cancelledAny || !stillScheduled) cancelledIds.push(id);
      throw new NotificationCancellationError(cancelledIds, cause);
    }
  }
  return cancelledIds;
}

async function ensureNotificationCapacity(requestedCount: number, replacedSeriesId?: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const retainedCount = replacedSeriesId
    ? scheduled.filter(({ identifier }) => identifier !== replacedSeriesId && !identifier.startsWith(`${replacedSeriesId}:`)).length
    : scheduled.length;
  if (retainedCount + requestedCount > MAX_SCHEDULED_MEDICATION_NOTIFICATIONS) {
    throw new RangeError(`Android ne peut pas dépasser ${MAX_SCHEDULED_MEDICATION_NOTIFICATIONS} notifications DRÉPA planifiées.`);
  }
}

async function runWithSchedulingLock<T>(task: () => Promise<T>) {
  const result = schedulingQueue.then(task, task);
  schedulingQueue = result.then(() => undefined, () => undefined);
  return result;
}
