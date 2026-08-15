// Réconciliation des notifications : compare les traces privées Supabase aux alarmes Android après onboarding.
// Elle vérifie chaque occurrence attendue, reprend les erreurs transitoires et s’arrête lors d’un changement de compte.
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/lib/supabase';
import {
  cancelNotificationIds,
  getScheduledNotifications,
  hasMedicationNotificationPermission,
  resumeMedicationNotificationScheduling,
  scheduleMedicationReminder,
  scheduleMedicationSnoozeAt,
} from './notifications';
import { buildMedicationNotificationSchedule } from './notification-schedule';
import { setMedicationNotificationHealth } from './notification-health';
import { runMedicationOperation } from './operation-lock';
import type { Medication, MedicationIntake, MedicationReminder } from './queries';

type ReconciliationMedication = Pick<Medication, 'end_date' | 'id' | 'is_active' | 'start_date'>;
type ReconciliationReminder = Pick<MedicationReminder, 'id' | 'is_enabled' | 'medication_id' | 'notification_id' | 'reminder_time'>;
type ReconciliationIntake = Pick<MedicationIntake, 'id' | 'snooze_notification_id' | 'snoozed_until' | 'status'>;
type ScheduledNotification = Awaited<ReturnType<typeof getScheduledNotifications>>[number];

export function useMedicationNotificationReconciliation(userId: string | undefined, enabled: boolean) {
  useEffect(() => {
    if (!userId || !enabled) return undefined;
    resumeMedicationNotificationScheduling();
    let active = true;
    let running = false;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const run = async (attempt = 0) => {
      if (!active || running) return;
      running = true;
      setMedicationNotificationHealth('checking');
      try {
        const result = await runMedicationOperation(() => reconcileMedicationNotifications(userId, () => active));
        if (active && result) setMedicationNotificationHealth(result);
      } catch {
        if (active && attempt < 2) {
          retry = setTimeout(() => void run(attempt + 1), 1_000 * (attempt + 1));
        } else if (active) {
          setMedicationNotificationHealth('error');
        }
      } finally {
        running = false;
      }
    };

    void run();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run();
    });

    return () => {
      active = false;
      setMedicationNotificationHealth('unknown');
      clearTimeout(retry);
      appStateSubscription.remove();
    };
  }, [enabled, userId]);
}

export async function reconcileMedicationNotifications(userId: string, shouldContinue = () => true) {
  const client = supabase;
  if (!client || !shouldContinue()) return undefined;

  const [medicationResult, reminderResult, intakeResult] = await Promise.all([
    client.from('medications').select('id,start_date,end_date,is_active').eq('user_id', userId),
    client.from('medication_reminders').select('id,medication_id,reminder_time,is_enabled,notification_id').eq('user_id', userId),
    client.from('medication_intakes').select('id,status,snoozed_until,snooze_notification_id').eq('user_id', userId).eq('status', 'snoozed'),
  ]);
  if (!shouldContinue()) return undefined;
  if (medicationResult.error) throw medicationResult.error;
  if (reminderResult.error) throw reminderResult.error;
  if (intakeResult.error) throw intakeResult.error;

  const medications = (medicationResult.data ?? []) as ReconciliationMedication[];
  const reminders = (reminderResult.data ?? []) as ReconciliationReminder[];
  const intakes = (intakeResult.data ?? []) as ReconciliationIntake[];
  let scheduledNotifications = await getScheduledNotifications();
  let scheduledIds = new Set(scheduledNotifications.map(({ identifier }) => identifier));
  if (!shouldContinue()) return undefined;
  const permissionGranted = await hasMedicationNotificationPermission();
  const knownMedicationSeries = buildKnownMedicationSeries(medications, reminders);
  const knownSnoozes = new Set(intakes.map((intake) => intake.snooze_notification_id).filter((id): id is string => Boolean(id)));

  // Les orphelins sont retirés avant toute réparation afin de libérer le budget Android.
  for (const identifier of scheduledIds) {
    if (!shouldContinue()) return undefined;
    const medicationOrphan = identifier.startsWith('drepa-med:')
      && ![...knownMedicationSeries].some((seriesId) => identifier === seriesId || identifier.startsWith(`${seriesId}:`));
    const snoozeOrphan = identifier.startsWith('drepa-snooze:') && !knownSnoozes.has(identifier);
    if ((medicationOrphan || snoozeOrphan) && !await traceNowExists(client, userId, identifier)) {
      await cancelNotificationIds([identifier]);
    }
  }
  scheduledNotifications = await getScheduledNotifications();
  scheduledIds = new Set(scheduledNotifications.map(({ identifier }) => identifier));
  let repairFailed = false;

  for (const reminder of reminders) {
    if (!shouldContinue()) return undefined;
    const medication = medications.find((item) => item.id === reminder.medication_id);
    if (!medication) continue;
    const time = reminder.reminder_time.slice(0, 5);
    let schedule;
    try {
      schedule = buildMedicationNotificationSchedule(medication.id, time, medication.start_date, medication.end_date);
    } catch {
      if (await reminderStillMatches(client, userId, reminder, medication)) {
        await cancelNotificationIds([reminder.notification_id]);
        await updateReminderTrace(client, userId, reminder.id, false, null, reminder);
      }
      continue;
    }
    const seriesId = schedule.seriesId;
    const expectedIds = new Set(schedule.occurrences.map((occurrence) => occurrence.identifier));
    const currentSeriesIds = new Set([...scheduledIds].filter((identifier) => identifier === seriesId || identifier.startsWith(`${seriesId}:`)));
    const datesMatch = schedule.occurrences.every((occurrence) => {
      const request = scheduledNotifications.find(({ identifier }) => identifier === occurrence.identifier);
      return request ? dateTriggerMatches(request, occurrence.date) : false;
    });
    const seriesComplete = datesMatch && setsEqual(expectedIds, currentSeriesIds);
    const storedScheduled = Boolean(reminder.notification_id && hasSeries(scheduledIds, reminder.notification_id));

    if (!medication.is_active || expectedIds.size === 0) {
      if (!await reminderStillMatches(client, userId, reminder, medication)) continue;
      await cancelNotificationIds([reminder.notification_id, seriesId]);
      if (!await reminderStillMatches(client, userId, reminder, medication)) {
        repairFailed = true;
        continue;
      }
      await updateReminderTrace(client, userId, reminder.id, false, null, reminder);
      continue;
    }

    if (reminder.notification_id && reminder.notification_id !== seriesId && storedScheduled) {
      await cancelNotificationIds([reminder.notification_id]);
      scheduledIds.delete(reminder.notification_id);
    }

    if (seriesComplete) {
      if (!reminder.is_enabled || reminder.notification_id !== seriesId) {
        await updateReminderTrace(client, userId, reminder.id, true, seriesId, reminder);
      }
      continue;
    }

    // Sans permission, la configuration déclarée reste intacte et l’interface ne prétend pas l’avoir désactivée.
    if (!permissionGranted) continue;
    if (!await reminderStillMatches(client, userId, reminder, medication)) continue;
    await cancelNotificationIds([seriesId]);
    if (!await reminderStillMatches(client, userId, reminder, medication)) {
      repairFailed = true;
      continue;
    }
    await updateReminderTrace(client, userId, reminder.id, false, seriesId, reminder);
    try {
      await scheduleMedicationReminder(time, medication.id, medication.start_date, medication.end_date);
      if (!shouldContinue()) return undefined;
      try {
        await updateReminderTrace(client, userId, reminder.id, true, seriesId, {
          ...reminder,
          is_enabled: false,
          notification_id: seriesId,
        });
      } catch (error) {
        await cancelNotificationIds([seriesId]);
        throw error;
      }
      for (const identifier of expectedIds) scheduledIds.add(identifier);
    } catch {
      // La trace désactivée reste disponible pour la prochaine réconciliation ou une suppression explicite.
      repairFailed = true;
    }
  }

  for (const intake of intakes) {
    if (!shouldContinue()) return undefined;
    if (!intake.snooze_notification_id || !intake.snoozed_until) continue;
    const snoozedUntil = new Date(intake.snoozed_until);
    if (snoozedUntil.getTime() <= Date.now()) {
      if (!await intakeStillMatches(client, userId, intake)) continue;
      await cancelNotificationIds([intake.snooze_notification_id]);
      if (!await intakeStillMatches(client, userId, intake)) {
        repairFailed = true;
        continue;
      }
      const { data, error } = await client.from('medication_intakes').update({
        status: 'pending',
        snoozed_until: null,
        snooze_notification_id: null,
      }).eq('id', intake.id)
        .eq('user_id', userId)
        .eq('status', intake.status)
        .eq('snoozed_until', intake.snoozed_until)
        .eq('snooze_notification_id', intake.snooze_notification_id)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Le report à réconcilier a été modifié.');
      continue;
    }
    const snoozeRequest = scheduledNotifications.find(({ identifier }) => identifier === intake.snooze_notification_id);
    const snoozeComplete = snoozeRequest ? dateTriggerMatches(snoozeRequest, snoozedUntil) : false;
    if (permissionGranted && !snoozeComplete) {
      if (!await intakeStillMatches(client, userId, intake)) continue;
      await cancelNotificationIds([intake.snooze_notification_id]);
      try {
        await scheduleMedicationSnoozeAt(snoozedUntil, intake.snooze_notification_id);
        if (!await intakeStillMatches(client, userId, intake)) {
          await cancelNotificationIds([intake.snooze_notification_id]);
          repairFailed = true;
        }
      } catch {
        // La trace du report reste en base pour une prochaine tentative.
        repairFailed = true;
      }
    }
  }

  if (repairFailed) throw new Error('La réconciliation des notifications doit être relancée.');
  return permissionGranted ? 'scheduled' as const : 'permission-denied' as const;
}

function buildKnownMedicationSeries(medications: ReconciliationMedication[], reminders: ReconciliationReminder[]) {
  const series = new Set<string>();
  for (const reminder of reminders) {
    const medication = medications.find((item) => item.id === reminder.medication_id);
    if (!medication) continue;
    try {
      series.add(buildMedicationNotificationSchedule(
        medication.id,
        reminder.reminder_time.slice(0, 5),
        medication.start_date,
        medication.end_date,
      ).seriesId);
    } catch {
      // Une donnée ancienne invalide n’autorise pas à deviner une série locale.
    }
  }
  return series;
}

function hasSeries(identifiers: Set<string>, seriesId: string) {
  return [...identifiers].some((identifier) => identifier === seriesId || identifier.startsWith(`${seriesId}:`));
}

function setsEqual(first: Set<string>, second: Set<string>) {
  return first.size === second.size && [...first].every((value) => second.has(value));
}

function dateTriggerMatches(request: ScheduledNotification, expected: Date) {
  const trigger = request.trigger;
  if (!trigger || !('type' in trigger) || trigger.type !== 'date') return false;
  const nativeTrigger = trigger as typeof trigger & { date?: Date | number; value?: number };
  const value = nativeTrigger.date ?? nativeTrigger.value;
  return value !== undefined && new Date(value).getTime() === expected.getTime();
}

async function reminderStillMatches(
  client: NonNullable<typeof supabase>,
  userId: string,
  reminder: ReconciliationReminder,
  medication: ReconciliationMedication,
) {
  const [reminderResult, medicationResult] = await Promise.all([
    client.from('medication_reminders').select('id,medication_id,reminder_time,is_enabled,notification_id').eq('id', reminder.id).eq('user_id', userId).maybeSingle(),
    client.from('medications').select('id,start_date,end_date,is_active').eq('id', medication.id).eq('user_id', userId).maybeSingle(),
  ]);
  if (reminderResult.error) throw reminderResult.error;
  if (medicationResult.error) throw medicationResult.error;
  return reminderResult.data?.medication_id === reminder.medication_id
    && reminderResult.data.reminder_time.slice(0, 5) === reminder.reminder_time.slice(0, 5)
    && reminderResult.data.is_enabled === reminder.is_enabled
    && reminderResult.data.notification_id === reminder.notification_id
    && medicationResult.data?.is_active === medication.is_active
    && medicationResult.data.start_date === medication.start_date
    && medicationResult.data.end_date === medication.end_date;
}

async function intakeStillMatches(
  client: NonNullable<typeof supabase>,
  userId: string,
  intake: ReconciliationIntake,
) {
  const { data, error } = await client.from('medication_intakes')
    .select('id,status,snoozed_until,snooze_notification_id')
    .eq('id', intake.id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.status === intake.status
    && data.snoozed_until === intake.snoozed_until
    && data.snooze_notification_id === intake.snooze_notification_id;
}

async function traceNowExists(client: NonNullable<typeof supabase>, userId: string, identifier: string) {
  if (identifier.startsWith('drepa-med:')) {
    const seriesId = identifier.split(':').slice(0, 3).join(':');
    const { data, error } = await client.from('medication_reminders').select('id')
      .eq('user_id', userId)
      .eq('notification_id', seriesId)
      .limit(1);
    if (error) throw error;
    return Boolean(data?.length);
  }
  if (identifier.startsWith('drepa-snooze:')) {
    const { data, error } = await client.from('medication_intakes').select('id')
      .eq('user_id', userId)
      .eq('snooze_notification_id', identifier)
      .limit(1);
    if (error) throw error;
    return Boolean(data?.length);
  }
  return false;
}

async function updateReminderTrace(
  client: NonNullable<typeof supabase>,
  userId: string,
  reminderId: string,
  isEnabled: boolean,
  notificationId: string | null,
  expected: ReconciliationReminder,
) {
  let query = client.from('medication_reminders').update({
    is_enabled: isEnabled,
    notification_id: notificationId,
  }).eq('id', reminderId)
    .eq('user_id', userId)
    .eq('is_enabled', expected.is_enabled);
  query = expected.notification_id === null
    ? query.is('notification_id', null)
    : query.eq('notification_id', expected.notification_id);
  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Le rappel à réconcilier n’existe plus.');
}
