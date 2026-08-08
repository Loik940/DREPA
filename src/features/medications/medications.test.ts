// Tests des contrats, statuts horaires et erreurs du module Médicaments.
import { classifyMedicationError } from './errors';
import type { Medication, MedicationIntake, MedicationReminder } from './queries';
import { medicationDefaults, medicationSchema, parseReminderTimes } from './schemas';
import { buildTodayReminders } from './status';

const medication: Medication = {
  id: 'medication-a',
  user_id: 'user-a',
  name: 'Traitement de test',
  dosage: 'Dosage prescrit',
  frequency: 'Quotidien',
  start_date: '2026-08-01',
  end_date: null,
  is_active: true,
  notes: null,
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
};

const reminder: MedicationReminder = {
  id: 'reminder-a',
  user_id: 'user-a',
  medication_id: 'medication-a',
  reminder_time: '08:00:00',
  is_enabled: true,
  notification_id: null,
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
};

// Ces tests couvrent les contrats et statuts techniques ; ils ne valident ni prescription, ni dosage, ni prise réelle.
describe('medication contracts', () => {
  it('parses unique valid reminder times', () => {
    expect(parseReminderTimes('20:00, 08:00, 20:00, invalide')).toEqual(['08:00', '20:00']);
  });

  it('requires a reminder time only when reminders are enabled', () => {
    expect(medicationSchema.safeParse(medicationDefaults).success).toBe(false);
    const values = { ...medicationDefaults, name: 'Traitement', dosage: 'Prescrit', frequency: 'Quotidien' };
    expect(medicationSchema.safeParse(values).success).toBe(true);
    expect(medicationSchema.safeParse({ ...values, reminders_enabled: true }).success).toBe(false);
  });

  it('classifies 403 as an RLS error', () => {
    expect(classifyMedicationError({ status: 403 }, 'list').kind).toBe('rls');
  });

  it('marks a past reminder late and a declared intake taken', () => {
    const now = new Date(2026, 7, 7, 12, 0, 0);
    const late = buildTodayReminders([medication], [reminder], [], now);
    expect(late[0]?.status).toBe('late');

    const intake: MedicationIntake = {
      id: 'intake-a',
      user_id: 'user-a',
      medication_id: medication.id,
      scheduled_at: late[0].scheduledAt,
      taken_at: now.toISOString(),
      status: 'taken',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    expect(buildTodayReminders([medication], [reminder], [intake], now)[0]?.status).toBe('taken');
  });
});
