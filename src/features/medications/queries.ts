// Query Médicaments : charge traitements, rappels et prises du jour du seul utilisateur authentifié.
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Database } from '@/types/database.types';
import { classifyMedicationError, MedicationDataError } from './errors';
import { getTodayBounds } from './status';

export type Medication = Database['public']['Tables']['medications']['Row'];
export type MedicationReminder = Database['public']['Tables']['medication_reminders']['Row'];
export type MedicationIntake = Database['public']['Tables']['medication_intakes']['Row'];

export const medicationsQueryKey = (userId: string) => ['medications', userId] as const;

function requireClient() {
  if (!supabase) throw new MedicationDataError('list', 'configuration', 'La configuration des traitements est indisponible.');
  return supabase;
}

async function fetchMedicationDashboard(userId: string) {
  try {
    const { start, end } = getTodayBounds();
    const client = requireClient();
    const [medicationsResult, remindersResult, intakesResult] = await Promise.all([
      client.from('medications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      client.from('medication_reminders').select('*').eq('user_id', userId).order('reminder_time'),
      client.from('medication_intakes').select('*').eq('user_id', userId).gte('scheduled_at', start).lt('scheduled_at', end),
    ]);

    if (medicationsResult.error) throw medicationsResult.error;
    if (remindersResult.error) throw remindersResult.error;
    if (intakesResult.error) throw intakesResult.error;

    return {
      medications: (medicationsResult.data ?? []) as Medication[],
      reminders: (remindersResult.data ?? []) as MedicationReminder[],
      intakes: (intakesResult.data ?? []) as MedicationIntake[],
    };
  } catch (error) {
    throw classifyMedicationError(error, 'list');
  }
}

export function useMedicationDashboardQuery(userId: string | undefined) {
  const { sessionReady, status, user } = useAuth();
  const enabled = sessionReady && status === 'authenticated' && Boolean(userId) && user?.id === userId;

  return useQuery({
    queryKey: userId ? medicationsQueryKey(userId) : ['medications', 'anonymous'],
    queryFn: () => fetchMedicationDashboard(userId as string),
    enabled,
  });
}
