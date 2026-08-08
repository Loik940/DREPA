// Mutations Médicaments : crée les traitements/rappels et enregistre les prises déclarées.
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { classifyMedicationError, MedicationDataError } from './errors';
import { cancelMedicationReminder, ensureMedicationNotificationPermission, scheduleMedicationReminder } from './notifications';
import { medicationsQueryKey } from './queries';
import { parseReminderTimes, type MedicationValues } from './schemas';

// Mutations propriétaires : chaque écriture associe les données à la session active et à son utilisateur.
function requireClient(operation: 'create' | 'intake') {
  if (!supabase) throw new MedicationDataError(operation, 'configuration', 'La configuration des traitements est indisponible.');
  return supabase;
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

      // Rollback : si un rappel échoue, les notifications déjà créées et le traitement incomplet sont retirés.
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
        await Promise.all(scheduledIds.map((id) => cancelMedicationReminder(id)));
        await client.from('medications').delete().eq('id', medication.id).eq('user_id', userId);
        throw classifyMedicationError(error, 'create');
      }
    },
    // Invalidation du cache : le tableau de traitements est rechargé seulement après une création complète.
    onSuccess: async () => {
      if (userId) await queryClient.invalidateQueries({ queryKey: medicationsQueryKey(userId) });
    },
  });
}

export function useMarkMedicationTakenMutation(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, scheduledAt }: { medicationId: string; scheduledAt: string }) => {
      if (!userId) throw new MedicationDataError('intake', 'session', 'La session utilisateur est indisponible.');
      try {
        const now = new Date().toISOString();
        const { data, error } = await requireClient('intake')
          .from('medication_intakes')
          .upsert({ user_id: userId, medication_id: medicationId, scheduled_at: scheduledAt, taken_at: now, status: 'taken' }, { onConflict: 'medication_id,scheduled_at' })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (error) {
        throw classifyMedicationError(error, 'intake');
      }
    },
    // Invalidation du cache : la prise déclarée est relue depuis la source après son enregistrement.
    onSuccess: async () => {
      if (userId) await queryClient.invalidateQueries({ queryKey: medicationsQueryKey(userId) });
    },
  });
}
