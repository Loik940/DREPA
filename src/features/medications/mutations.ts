// Mutations Médicaments : gère le cycle des traitements, rappels et prises déclarées.
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import { classifyMedicationError, MedicationDataError, type MedicationOperation } from './errors';
import { filterByNotificationIds } from './notification-ids';
import {
  cancelNotificationIds,
  ensureMedicationNotificationPermission,
  NotificationCancellationError,
  scheduleMedicationReminder,
  scheduleMedicationSnooze,
} from './notifications';
import {
  medicationDetailQueryKey,
  medicationsQueryKey,
  type MedicationIntake,
  type MedicationReminder,
} from './queries';
import { parseReminderTimes, type MedicationValues } from './schemas';

type MedicationIntakeAction = 'taken' | 'skipped' | 'snoozed';
type MedicationIntakeUpdate = Pick<Database['public']['Tables']['medication_intakes']['Update'], 'status' | 'taken_at' | 'snoozed_until' | 'snooze_notification_id'>;
type MedicationClient = NonNullable<typeof supabase>;
type SnoozeIntakeSnapshot = Pick<MedicationIntake, 'id' | 'status' | 'taken_at' | 'snoozed_until' | 'snooze_notification_id'>;

export type MedicationIntakePayload = {
  medicationId: string;
  intakeId: string | null;
  originalScheduledAt: string;
  snoozeNotificationId: string | null;
  snoozedUntil: string | null;
};

// Mutations propriétaires : chaque écriture utilise l’identifiant de la session et un filtre user_id.
function requireClient(operation: MedicationOperation) {
  if (!supabase) throw new MedicationDataError(operation, 'configuration', 'La configuration des traitements est indisponible.');
  return supabase;
}

async function invalidateMedicationQueries(queryClient: QueryClient, userId: string, medicationId?: string) {
  await queryClient.invalidateQueries({ queryKey: medicationsQueryKey(userId) });
  if (medicationId) await queryClient.invalidateQueries({ queryKey: medicationDetailQueryKey(userId, medicationId) });
}

// Chaque étape de restauration est tentée ; le résultat permet de signaler une compensation incomplète.
async function runCompensationSteps(steps: readonly (() => Promise<void>)[]) {
  let failed = false;
  for (const step of steps) {
    try {
      await step();
    } catch {
      failed = true;
    }
  }
  return failed;
}

function classifyWithCompensation(error: unknown, operation: MedicationOperation, compensationFailed: boolean) {
  const classified = classifyMedicationError(error, operation);
  if (!compensationFailed) return classified;
  return new MedicationDataError(
    operation,
    classified.kind,
    `${classified.message} La restauration automatique n’a pas pu être terminée.`,
  );
}

async function cancelBeforeMutation(
  ids: readonly (string | null | undefined)[],
  operation: MedicationOperation,
  restoreCancelled?: (cancelledIds: string[]) => Promise<void>,
) {
  try {
    return await cancelNotificationIds(ids);
  } catch (error) {
    let compensationFailed = false;
    if (error instanceof NotificationCancellationError && error.cancelledIds.length && restoreCancelled) {
      try {
        await restoreCancelled(error.cancelledIds);
      } catch {
        compensationFailed = true;
      }
    }
    throw new MedicationDataError(
      operation,
      'unknown',
      compensationFailed
        ? 'Les notifications n’ont pas pu être annulées et leur restauration est incomplète. Aucune nouvelle modification n’a été enregistrée.'
        : 'Les notifications n’ont pas pu être annulées. Aucune modification n’a été enregistrée.',
    );
  }
}

// Après une annulation confirmée, les rappels précédents reçoivent de nouveaux identifiants persistés.
async function restoreReminderNotifications(
  client: MedicationClient,
  userId: string,
  reminders: readonly MedicationReminder[],
) {
  let failed = false;
  for (const reminder of reminders) {
    if (!reminder.notification_id) continue;
    if (!reminder.is_enabled) {
      try {
        const { error } = await client.from('medication_reminders').update({ notification_id: null })
          .eq('id', reminder.id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch {
        failed = true;
      }
      continue;
    }
    let replacementId: string | null = null;
    try {
      replacementId = await scheduleMedicationReminder(reminder.reminder_time.slice(0, 5));
      const { data, error } = await client.from('medication_reminders').update({
        is_enabled: true,
        notification_id: replacementId,
      }).eq('id', reminder.id).eq('user_id', userId).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Le rappel à restaurer est introuvable.');
    } catch {
      failed = true;
      if (replacementId) {
        try {
          await cancelNotificationIds([replacementId]);
        } catch {
          failed = true;
        }
      }
    }
  }
  if (failed) throw new Error('La restauration des rappels est incomplète.');
}

// Les reports encore futurs sont reprogrammés et leur nouvel identifiant est immédiatement sauvegardé.
async function restoreSnoozeNotifications(
  client: MedicationClient,
  userId: string,
  intakes: readonly SnoozeIntakeSnapshot[],
) {
  let failed = false;
  for (const intake of intakes) {
    if (!intake.snooze_notification_id) continue;
    if (intake.status !== 'snoozed' || !intake.snoozed_until) {
      try {
        const { error } = await client.from('medication_intakes').update({ snooze_notification_id: null })
          .eq('id', intake.id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch {
        failed = true;
      }
      continue;
    }
    const remainingMinutes = Math.ceil((new Date(intake.snoozed_until).getTime() - Date.now()) / 60_000);
    if (remainingMinutes <= 0) {
      try {
        const { error } = await client.from('medication_intakes').update({
          status: 'pending',
          taken_at: null,
          snoozed_until: null,
          snooze_notification_id: null,
        })
          .eq('id', intake.id)
          .eq('user_id', userId);
        if (error) throw error;
      } catch {
        failed = true;
      }
      continue;
    }
    let replacementId: string | null = null;
    try {
      replacementId = await scheduleMedicationSnooze(remainingMinutes);
      const { data, error } = await client.from('medication_intakes').update({
        status: intake.status,
        taken_at: intake.taken_at,
        snoozed_until: intake.snoozed_until,
        snooze_notification_id: replacementId,
      }).eq('id', intake.id).eq('user_id', userId).select('id').maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Le report à restaurer est introuvable.');
    } catch {
      failed = true;
      if (replacementId) {
        try {
          await cancelNotificationIds([replacementId]);
        } catch {
          failed = true;
        }
      }
    }
  }
  if (failed) throw new Error('La restauration des reports est incomplète.');
}

async function restoreCancelledSnapshots(
  client: MedicationClient,
  userId: string,
  reminders: readonly MedicationReminder[],
  intakes: readonly SnoozeIntakeSnapshot[],
  cancelledIds: readonly string[],
) {
  const cancelledReminders = filterByNotificationIds(reminders, cancelledIds, (reminder) => reminder.notification_id);
  const cancelledIntakes = filterByNotificationIds(intakes, cancelledIds, (intake) => intake.snooze_notification_id);
  const failed = await runCompensationSteps([
    () => restoreReminderNotifications(client, userId, cancelledReminders),
    () => restoreSnoozeNotifications(client, userId, cancelledIntakes),
  ]);
  if (failed) throw new Error('La restauration des annulations partielles est incomplète.');
}

export function useCreateMedicationMutation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: MedicationValues) => {
      if (!userId) throw new MedicationDataError('create', 'session', 'La session utilisateur est indisponible.');
      const times = values.reminders_enabled ? parseReminderTimes(values.reminder_times) : [];
      if (times.length) await ensureMedicationNotificationPermission();

      const client = requireClient('create');
      const { data: medication, error: medicationError } = await client
        .from('medications')
        .insert({
          user_id: userId,
          name: values.name,
          dosage: values.dosage,
          frequency: values.frequency,
          start_date: values.start_date,
          end_date: values.end_date || null,
          is_active: true,
          notes: values.notes || null,
        })
        .select()
        .single();

      if (medicationError) throw classifyMedicationError(medicationError, 'create');

      // Compensation locale : tout rappel créé est annulé si la base refuse la suite de la création.
      const scheduledIds: string[] = [];
      try {
        for (const time of times) scheduledIds.push(await scheduleMedicationReminder(time));
        if (times.length) {
          const { error } = await client.from('medication_reminders').insert(times.map((time, index) => ({
            user_id: userId,
            medication_id: medication.id,
            reminder_time: time,
            is_enabled: true,
            notification_id: scheduledIds[index],
          })));
          if (error) throw error;
        }
        return medication;
      } catch (error) {
        let compensationFailed = false;
        try {
          await cancelNotificationIds(scheduledIds);
        } catch {
          compensationFailed = true;
        }

        // La ligne reste visible si une notification n’a pas pu être annulée, afin de ne pas perdre sa trace locale.
        if (!compensationFailed) {
          const { error: cleanupError } = await client.from('medications').delete().eq('id', medication.id).eq('user_id', userId);
          compensationFailed = Boolean(cleanupError);
        }
        throw classifyWithCompensation(error, 'create', compensationFailed);
      }
    },
    onSuccess: async () => {
      if (userId) await invalidateMedicationQueries(queryClient, userId);
    },
  });
}

export function useUpdateMedicationMutation(userId: string | undefined, medicationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: MedicationValues) => {
      if (!userId || !medicationId) throw new MedicationDataError('update', 'session', 'La session utilisateur est indisponible.');
      const client = requireClient('update');
      const [medicationResult, remindersResult, intakesResult] = await Promise.all([
        client.from('medications').select('*').eq('id', medicationId).eq('user_id', userId).maybeSingle(),
        client.from('medication_reminders').select('*').eq('medication_id', medicationId).eq('user_id', userId),
        client.from('medication_intakes').select('id,status,taken_at,snoozed_until,snooze_notification_id').eq('medication_id', medicationId).eq('user_id', userId),
      ]);
      if (medicationResult.error) throw classifyMedicationError(medicationResult.error, 'update');
      if (remindersResult.error) throw classifyMedicationError(remindersResult.error, 'update');
      if (intakesResult.error) throw classifyMedicationError(intakesResult.error, 'update');
      if (!medicationResult.data) throw new MedicationDataError('update', 'not_found', 'Ce traitement est introuvable.');

      const previousMedication = medicationResult.data;
      const existingReminders = (remindersResult.data ?? []) as MedicationReminder[];
      const snoozeIntakes = (intakesResult.data ?? []) as SnoozeIntakeSnapshot[];
      const requestedTimes = values.reminders_enabled ? parseReminderTimes(values.reminder_times) : [];
      const existingByTime = new Map(existingReminders.map((reminder) => [reminder.reminder_time.slice(0, 5), reminder]));
      const addedTimes = requestedTimes.filter((time) => !existingByTime.has(time));
      const removedReminders = existingReminders.filter((reminder) => !requestedTimes.includes(reminder.reminder_time.slice(0, 5)));
      const remindersToReprogram = previousMedication.is_active
        ? existingReminders.filter((reminder) => requestedTimes.includes(reminder.reminder_time.slice(0, 5)) && (!reminder.is_enabled || !reminder.notification_id))
        : [];
      const existingTimes = [...existingByTime.keys()].sort();
      const scheduleChanged = existingTimes.join(',') !== requestedTimes.join(',');
      const shouldCancelSnoozes = scheduleChanged || !values.reminders_enabled;
      const remindersBeingCancelled = [...removedReminders, ...remindersToReprogram];
      if (previousMedication.is_active && (addedTimes.length || remindersToReprogram.length)) {
        await ensureMedicationNotificationPermission();
      }

      // Les anciens rappels et reports sont annulés avant toute suppression ou remise à zéro en base.
      const cancelledIds = await cancelBeforeMutation([
        ...removedReminders.map((reminder) => reminder.notification_id),
        ...remindersToReprogram.map((reminder) => reminder.notification_id),
        ...(shouldCancelSnoozes ? snoozeIntakes.map((intake) => intake.snooze_notification_id) : []),
      ], 'update', (partiallyCancelledIds) => restoreCancelledSnapshots(
        client,
        userId,
        remindersBeingCancelled,
        shouldCancelSnoozes ? snoozeIntakes : [],
        partiallyCancelledIds,
      ));

      const newNotificationIds: string[] = [];
      const insertedReminderIds: string[] = [];
      const notificationIdByTime = new Map<string, string>();
      try {
        if (shouldCancelSnoozes && snoozeIntakes.length) {
          const { error } = await client.from('medication_intakes').update({
            status: 'pending',
            taken_at: null,
            snoozed_until: null,
            snooze_notification_id: null,
          })
            .eq('medication_id', medicationId)
            .eq('user_id', userId)
            .eq('status', 'snoozed');
          if (error) throw error;
        }

        if (previousMedication.is_active) {
          for (const time of addedTimes) {
            const notificationId = await scheduleMedicationReminder(time);
            newNotificationIds.push(notificationId);
            notificationIdByTime.set(time, notificationId);
          }
          for (const reminder of remindersToReprogram) {
            const time = reminder.reminder_time.slice(0, 5);
            const notificationId = await scheduleMedicationReminder(time);
            newNotificationIds.push(notificationId);
            notificationIdByTime.set(time, notificationId);
          }
        }

        const { data: medication, error: medicationError } = await client
          .from('medications')
          .update({
            name: values.name,
            dosage: values.dosage,
            frequency: values.frequency,
            start_date: values.start_date,
            end_date: values.end_date || null,
            notes: values.notes || null,
          })
          .eq('id', medicationId)
          .eq('user_id', userId)
          .select()
          .single();
        if (medicationError) throw medicationError;

        if (addedTimes.length) {
          const { data: inserted, error: insertError } = await client
            .from('medication_reminders')
            .insert(addedTimes.map((time) => ({
              user_id: userId,
              medication_id: medicationId,
              reminder_time: time,
              is_enabled: previousMedication.is_active,
              notification_id: notificationIdByTime.get(time) ?? null,
            })))
            .select('id');
          if (insertError) throw insertError;
          insertedReminderIds.push(...(inserted ?? []).map((item) => item.id));
        }

        for (const reminder of remindersToReprogram) {
          const { error } = await client.from('medication_reminders').update({
            is_enabled: true,
            notification_id: notificationIdByTime.get(reminder.reminder_time.slice(0, 5)) ?? null,
          }).eq('id', reminder.id).eq('user_id', userId);
          if (error) throw error;
        }

        if (removedReminders.length) {
          const { error: deleteError } = await client
            .from('medication_reminders')
            .delete()
            .eq('medication_id', medicationId)
            .eq('user_id', userId)
            .in('id', removedReminders.map((reminder) => reminder.id));
          if (deleteError) throw deleteError;
        }

        return medication;
      } catch (error) {
        // Les nouvelles notifications doivent être annulées avant de restaurer des identifiants précédents.
        try {
          await cancelNotificationIds(newNotificationIds);
        } catch {
          throw classifyWithCompensation(error, 'update', true);
        }

        // Compensation serveur : restaure les lignes, puis recrée uniquement les notifications annulées.
        const compensationFailed = await runCompensationSteps([
          async () => {
            const { error: restoreError } = await client.from('medications').update({
              name: previousMedication.name,
              dosage: previousMedication.dosage,
              frequency: previousMedication.frequency,
              start_date: previousMedication.start_date,
              end_date: previousMedication.end_date,
              notes: previousMedication.notes,
            }).eq('id', medicationId).eq('user_id', userId);
            if (restoreError) throw restoreError;
          },
          async () => {
            if (!insertedReminderIds.length) return;
            const { error: cleanupError } = await client.from('medication_reminders').delete().eq('user_id', userId).in('id', insertedReminderIds);
            if (cleanupError) throw cleanupError;
          },
          async () => {
            if (!existingReminders.length) return;
            const restoredReminders = existingReminders.map((reminder) => ({
              ...reminder,
              notification_id: reminder.is_enabled ? reminder.notification_id : null,
            }));
            const { error: restoreError } = await client.from('medication_reminders').upsert(restoredReminders);
            if (restoreError) throw restoreError;
          },
          () => restoreCancelledSnapshots(
            client,
            userId,
            remindersBeingCancelled,
            shouldCancelSnoozes ? snoozeIntakes : [],
            cancelledIds,
          ),
        ]);
        throw classifyWithCompensation(error, 'update', compensationFailed);
      }
    },
    onSuccess: async () => {
      if (userId && medicationId) await invalidateMedicationQueries(queryClient, userId, medicationId);
    },
  });
}

export function useSetMedicationActiveMutation(userId: string | undefined, medicationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (active: boolean) => {
      if (!userId || !medicationId) throw new MedicationDataError('activate', 'session', 'La session utilisateur est indisponible.');
      const client = requireClient('activate');
      const [medicationResult, remindersResult, intakesResult] = await Promise.all([
        client.from('medications').select('*').eq('id', medicationId).eq('user_id', userId).maybeSingle(),
        client.from('medication_reminders').select('*').eq('medication_id', medicationId).eq('user_id', userId).order('reminder_time'),
        client.from('medication_intakes').select('id,status,taken_at,snoozed_until,snooze_notification_id').eq('medication_id', medicationId).eq('user_id', userId),
      ]);
      if (medicationResult.error) throw classifyMedicationError(medicationResult.error, 'activate');
      if (remindersResult.error) throw classifyMedicationError(remindersResult.error, 'activate');
      if (intakesResult.error) throw classifyMedicationError(intakesResult.error, 'activate');
      if (!medicationResult.data) throw new MedicationDataError('activate', 'not_found', 'Ce traitement est introuvable.');
      const medication = medicationResult.data;
      if (medication.is_active === active) return medication;

      const reminders = (remindersResult.data ?? []) as MedicationReminder[];
      const snoozeIntakes = (intakesResult.data ?? []) as SnoozeIntakeSnapshot[];
      if (!active) {
        // L’arrêt ne modifie la base qu’après annulation confirmée de tous les rappels et reports connus.
        const cancelledIds = await cancelBeforeMutation([
          ...reminders.map((reminder) => reminder.notification_id),
          ...snoozeIntakes.map((intake) => intake.snooze_notification_id),
        ], 'activate', (partiallyCancelledIds) => restoreCancelledSnapshots(
          client,
          userId,
          reminders,
          snoozeIntakes,
          partiallyCancelledIds,
        ));
        try {
          const { error: reminderError } = await client.from('medication_reminders').update({
            is_enabled: false,
            notification_id: null,
          }).eq('medication_id', medicationId).eq('user_id', userId);
          if (reminderError) throw reminderError;
          const { error: intakeError } = await client.from('medication_intakes').update({
            status: 'pending',
            taken_at: null,
            snoozed_until: null,
            snooze_notification_id: null,
          })
            .eq('medication_id', medicationId)
            .eq('user_id', userId)
            .eq('status', 'snoozed');
          if (intakeError) throw intakeError;
          const { error: medicationError } = await client.from('medications').update({ is_active: false }).eq('id', medicationId).eq('user_id', userId);
          if (medicationError) throw medicationError;
          return { ...medication, is_active: false };
        } catch (error) {
          // Compensation best-effort : restaure les lignes, puis recrée les horaires et reports annulés.
          const compensationFailed = await runCompensationSteps([
            async () => {
              const { error: restoreError } = await client.from('medications').update({ is_active: true }).eq('id', medicationId).eq('user_id', userId);
              if (restoreError) throw restoreError;
            },
            async () => {
              if (!reminders.length) return;
              const restoredReminders = reminders.map((reminder) => ({
                ...reminder,
                notification_id: reminder.is_enabled ? reminder.notification_id : null,
              }));
              const { error: restoreError } = await client.from('medication_reminders').upsert(restoredReminders);
              if (restoreError) throw restoreError;
            },
            () => restoreCancelledSnapshots(client, userId, reminders, snoozeIntakes, cancelledIds),
          ]);
          throw classifyWithCompensation(error, 'activate', compensationFailed);
        }
      }

      if (reminders.length) await ensureMedicationNotificationPermission();
      // Les identifiants résiduels sont annulés strictement avant toute nouvelle programmation.
      const cancelledIds = await cancelBeforeMutation([
        ...reminders.map((reminder) => reminder.notification_id),
        ...snoozeIntakes.map((intake) => intake.snooze_notification_id),
      ], 'activate', (partiallyCancelledIds) => restoreCancelledSnapshots(
        client,
        userId,
        reminders,
        snoozeIntakes,
        partiallyCancelledIds,
      ));
      const notificationIds: string[] = [];
      try {
        const { error: intakeResetError } = await client.from('medication_intakes').update({
          status: 'pending',
          taken_at: null,
          snoozed_until: null,
          snooze_notification_id: null,
        })
          .eq('medication_id', medicationId)
          .eq('user_id', userId)
          .eq('status', 'snoozed');
        if (intakeResetError) throw intakeResetError;

        for (const reminder of reminders) {
          notificationIds.push(await scheduleMedicationReminder(reminder.reminder_time.slice(0, 5)));
        }
        for (const [index, reminder] of reminders.entries()) {
          const { error } = await client.from('medication_reminders').update({
            is_enabled: true,
            notification_id: notificationIds[index],
          }).eq('id', reminder.id).eq('user_id', userId);
          if (error) throw error;
        }
        const { data, error: medicationError } = await client
          .from('medications')
          .update({ is_active: true })
          .eq('id', medicationId)
          .eq('user_id', userId)
          .select()
          .single();
        if (medicationError) throw medicationError;
        return data;
      } catch (error) {
        // Une nouvelle notification doit être annulée avant que son identifiant soit retiré de la base.
        let cancellationFailed = false;
        try {
          await cancelNotificationIds(notificationIds);
        } catch {
          cancellationFailed = true;
        }

        const compensationSteps: (() => Promise<void>)[] = [async () => {
          const { error: stopError } = await client.from('medications').update({ is_active: false }).eq('id', medicationId).eq('user_id', userId);
          if (stopError) throw stopError;
        }];
        if (!cancellationFailed) {
          compensationSteps.push(
            async () => {
              const { error: reminderError } = await client.from('medication_reminders').update({ is_enabled: false, notification_id: null })
                .eq('medication_id', medicationId)
                .eq('user_id', userId);
              if (reminderError) throw reminderError;
            },
            async () => {
              const { error: intakeError } = await client.from('medication_intakes').update({
                status: 'pending',
                taken_at: null,
                snoozed_until: null,
                snooze_notification_id: null,
              })
                .eq('medication_id', medicationId)
                .eq('user_id', userId)
                .eq('status', 'snoozed');
              if (intakeError) throw intakeError;
            },
            () => restoreCancelledSnapshots(client, userId, [], snoozeIntakes, cancelledIds),
          );
        }
        const compensationFailed = await runCompensationSteps(compensationSteps);
        throw classifyWithCompensation(error, 'activate', cancellationFailed || compensationFailed);
      }
    },
    onSuccess: async () => {
      if (userId && medicationId) await invalidateMedicationQueries(queryClient, userId, medicationId);
    },
  });
}

export function useDeleteMedicationMutation(userId: string | undefined, medicationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId || !medicationId) throw new MedicationDataError('delete', 'session', 'La session utilisateur est indisponible.');
      const client = requireClient('delete');
      const [remindersResult, intakesResult] = await Promise.all([
        client.from('medication_reminders').select('*').eq('medication_id', medicationId).eq('user_id', userId),
        client.from('medication_intakes').select('id,status,taken_at,snoozed_until,snooze_notification_id').eq('medication_id', medicationId).eq('user_id', userId),
      ]);
      if (remindersResult.error) throw classifyMedicationError(remindersResult.error, 'delete');
      if (intakesResult.error) throw classifyMedicationError(intakesResult.error, 'delete');
      const reminders = (remindersResult.data ?? []) as MedicationReminder[];
      const snoozeIntakes = (intakesResult.data ?? []) as SnoozeIntakeSnapshot[];

      // Aucune cascade ne démarre avant l’annulation confirmée de tous les identifiants chargés.
      const cancelledIds = await cancelBeforeMutation([
        ...reminders.map((reminder) => reminder.notification_id),
        ...snoozeIntakes.map((intake) => intake.snooze_notification_id),
      ], 'delete', (partiallyCancelledIds) => restoreCancelledSnapshots(
        client,
        userId,
        reminders,
        snoozeIntakes,
        partiallyCancelledIds,
      ));
      try {
        const { data, error } = await client
          .from('medications')
          .delete()
          .eq('id', medicationId)
          .eq('user_id', userId)
          .select('id')
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new MedicationDataError('delete', 'not_found', 'Ce traitement est introuvable.');
        return data;
      } catch (error) {
        // Si la suppression serveur échoue, les notifications annulées sont recréées sans masquer l’échec initial.
        const compensationFailed = await runCompensationSteps([
          () => restoreCancelledSnapshots(client, userId, reminders, snoozeIntakes, cancelledIds),
        ]);
        const classified = classifyWithCompensation(error, 'delete', compensationFailed);
        throw new MedicationDataError(
          'delete',
          classified.kind,
          `Le traitement n’a pas été supprimé. ${classified.message}`,
        );
      }
    },
    onSuccess: async () => {
      if (userId) await invalidateMedicationQueries(queryClient, userId);
    },
  });
}

function useMedicationIntakeMutation(userId: string | undefined, action: MedicationIntakeAction) {
  const queryClient = useQueryClient();
  const operation: MedicationOperation = action === 'snoozed' ? 'snooze' : action === 'skipped' ? 'skip' : 'intake';

  return useMutation({
    mutationFn: async (payload: MedicationIntakePayload) => {
      if (!userId) throw new MedicationDataError(operation, 'session', 'La session utilisateur est indisponible.');
      const client = requireClient(operation);
      let newSnoozeNotificationId: string | null = null;
      let oldSnoozeCancelled = false;

      try {
        // Un report précédent est annulé avant de programmer ou d’écrire la nouvelle action.
        const cancelledIds = await cancelBeforeMutation([payload.snoozeNotificationId], operation);
        oldSnoozeCancelled = Boolean(
          payload.snoozeNotificationId && cancelledIds.includes(payload.snoozeNotificationId),
        );
        if (action === 'snoozed') newSnoozeNotificationId = await scheduleMedicationSnooze(10);
        const actionAt = new Date();
        const snoozedUntil = action === 'snoozed' ? new Date(actionAt.getTime() + 10 * 60 * 1000).toISOString() : null;
        const intakeUpdate: MedicationIntakeUpdate = {
          status: action,
          taken_at: action === 'taken' ? actionAt.toISOString() : null,
          snoozed_until: snoozedUntil,
          snooze_notification_id: newSnoozeNotificationId,
        };

        const result = payload.intakeId
          ? await client.from('medication_intakes').update(intakeUpdate)
            .eq('id', payload.intakeId)
            .eq('medication_id', payload.medicationId)
            .eq('user_id', userId)
            .select()
            .single()
          : await client.from('medication_intakes').upsert({
            user_id: userId,
            medication_id: payload.medicationId,
            scheduled_at: payload.originalScheduledAt,
            ...intakeUpdate,
          }, { onConflict: 'medication_id,scheduled_at' }).select().single();
        if (result.error) throw result.error;
        return result.data;
      } catch (error) {
        // Si l’écriture échoue, la nouvelle notification est annulée avant de perdre son identifiant local.
        let compensationFailed = false;
        if (newSnoozeNotificationId) {
          try {
            await cancelNotificationIds([newSnoozeNotificationId]);
          } catch {
            compensationFailed = true;
          }
        }

        // L’ancien report est recréé seulement après annulation confirmée de la nouvelle notification.
        if (!compensationFailed && oldSnoozeCancelled) {
          if (payload.intakeId && payload.snoozeNotificationId && payload.snoozedUntil) {
            try {
              await restoreSnoozeNotifications(client, userId, [{
                id: payload.intakeId,
                status: 'snoozed',
                taken_at: null,
                snoozed_until: payload.snoozedUntil,
                snooze_notification_id: payload.snoozeNotificationId,
              }]);
            } catch {
              compensationFailed = true;
            }
          } else {
            compensationFailed = true;
          }
        }
        throw classifyWithCompensation(error, operation, compensationFailed);
      }
    },
    onSuccess: async () => {
      if (userId) await invalidateMedicationQueries(queryClient, userId);
    },
  });
}

export function useMarkMedicationTakenMutation(userId: string | undefined) {
  return useMedicationIntakeMutation(userId, 'taken');
}

export function useSkipMedicationMutation(userId: string | undefined) {
  return useMedicationIntakeMutation(userId, 'skipped');
}

export function useSnoozeMedicationMutation(userId: string | undefined) {
  return useMedicationIntakeMutation(userId, 'snoozed');
}
