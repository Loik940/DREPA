// Tests des contrats, statuts horaires et erreurs du module Médicaments.
import { classifyMedicationError } from './errors';
import {
  filterByNotificationIds,
  NotificationCancellationError,
  uniqueNotificationIds,
} from './notification-ids';
import { assertMedicationNotificationBudget, buildMedicationNotificationSchedule } from './notification-schedule';
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

  it('accepts a future reminder series without making it infinite', () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    const futureDate = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
    const values = {
      ...medicationDefaults,
      name: 'Traitement',
      dosage: 'Prescrit',
      frequency: 'Quotidien',
      start_date: futureDate,
      reminder_times: '08:00',
      reminders_enabled: true,
    };

    expect(medicationSchema.safeParse(values).success).toBe(true);
    expect(medicationSchema.safeParse({ ...values, end_date: futureDate }).success).toBe(true);
  });

  it('returns validation errors for impossible calendar dates', () => {
    const values = {
      ...medicationDefaults,
      name: 'Traitement',
      dosage: 'Prescrit',
      frequency: 'Quotidien',
      start_date: '2026-02-31',
    };

    expect(() => medicationSchema.safeParse(values)).not.toThrow();
    expect(medicationSchema.safeParse(values).success).toBe(false);
  });

  it('builds bounded dated occurrences and a rolling thirty-day series', () => {
    const now = new Date(2026, 7, 7, 7, 0, 0);
    const dated = buildMedicationNotificationSchedule('medication-a', '08:00', '2026-08-06', '2026-08-08', now);
    const rolling = buildMedicationNotificationSchedule('medication-a', '08:00', '2026-08-01', null, now);

    expect(dated.mode).toBe('dated');
    expect(dated.occurrences.map((item) => item.date.getDate())).toEqual([7, 8]);
    expect(new Set(dated.occurrences.map((item) => item.identifier)).size).toBe(2);
    expect(rolling.mode).toBe('dated');
    expect(rolling.occurrences).toHaveLength(30);
    expect(buildMedicationNotificationSchedule('medication-a', '08:00', '2026-08-08', null, now).occurrences).toHaveLength(29);
    expect(buildMedicationNotificationSchedule('medication-a', '08:00', '2026-08-07', '2027-08-08', now).occurrences).toHaveLength(30);
    expect(() => assertMedicationNotificationBudget(
      'medication-a',
      Array.from({ length: 13 }, (_, index) => `${String(index + 1).padStart(2, '0')}:00`),
      '2026-08-07',
      '2027-02-07',
      now,
    )).toThrow();
  });

  it('keeps a snoozed reminder visible after midnight', () => {
    const now = new Date(2026, 7, 8, 0, 5, 0);
    const intake: MedicationIntake = {
      id: 'carryover-intake',
      user_id: 'user-a',
      medication_id: medication.id,
      scheduled_at: new Date(2026, 7, 7, 23, 55, 0).toISOString(),
      status: 'snoozed',
      taken_at: null,
      snoozed_until: new Date(2026, 7, 8, 0, 10, 0).toISOString(),
      snooze_notification_id: 'snooze-a',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    const lateReminder = { ...reminder, reminder_time: '23:55:00' };
    const result = buildTodayReminders([medication], [lateReminder], [intake], now);
    expect(result.some((item) => item.displayId === intake.id && item.status === 'snoozed')).toBe(true);
  });

  it('classifies 403 as an RLS error', () => {
    expect(classifyMedicationError({ status: 403 }, 'list').kind).toBe('rls');
  });

  it('deduplicates valid notification identifiers', () => {
    expect(uniqueNotificationIds(['notification-a', null, 'notification-a', undefined, 'notification-b'])).toEqual([
      'notification-a',
      'notification-b',
    ]);
  });

  it('keeps cancelled identifiers and the original cancellation cause', () => {
    const cause = new Error('échec local simulé');
    const error = new NotificationCancellationError(['notification-a'], cause);
    expect(error.cancelledIds).toEqual(['notification-a']);
    expect(error.cause).toBe(cause);
  });

  it('filters only snapshots whose notification was cancelled', () => {
    const snapshots = [
      { id: 'a', notificationId: 'notification-a' },
      { id: 'b', notificationId: 'notification-b' },
      { id: 'c', notificationId: null },
    ];
    expect(filterByNotificationIds(snapshots, ['notification-b'], (item) => item.notificationId)).toEqual([
      snapshots[1],
    ]);
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
      snoozed_until: null,
      snooze_notification_id: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    const taken = buildTodayReminders([medication], [reminder], [intake], now)[0];
    expect(taken?.status).toBe('taken');
    expect(taken?.intakeId).toBe('intake-a');
    expect(taken?.originalScheduledAt).toBe(late[0]?.scheduledAt);
  });

  it('keeps reminders only inside the declared treatment dates', () => {
    const now = new Date(2026, 7, 7, 12, 0, 0);
    const future = { ...medication, start_date: '2026-08-08' };
    const ended = { ...medication, end_date: '2026-08-06' };
    const endingToday = { ...medication, end_date: '2026-08-07' };

    expect(buildTodayReminders([future], [reminder], [], now)).toHaveLength(0);
    expect(buildTodayReminders([ended], [reminder], [], now)).toHaveLength(0);
    expect(buildTodayReminders([endingToday], [reminder], [], now)).toHaveLength(1);
  });

  it('keeps a snoozed reminder snoozed before its effective time then marks it late', () => {
    const before = new Date(2026, 7, 7, 12, 0, 0);
    const originalScheduledAt = new Date(2026, 7, 7, 8, 0, 0).toISOString();
    const snoozedUntil = new Date(2026, 7, 7, 12, 10, 0).toISOString();
    const intake: MedicationIntake = {
      id: 'intake-snoozed',
      user_id: 'user-a',
      medication_id: medication.id,
      scheduled_at: originalScheduledAt,
      taken_at: null,
      status: 'snoozed',
      snoozed_until: snoozedUntil,
      snooze_notification_id: 'notification-snoozed',
      created_at: before.toISOString(),
      updated_at: before.toISOString(),
    };

    const snoozed = buildTodayReminders([medication], [reminder], [intake], before)[0];
    expect(snoozed).toMatchObject({
      intakeId: 'intake-snoozed',
      originalScheduledAt,
      scheduledAt: snoozedUntil,
      snoozeNotificationId: 'notification-snoozed',
      snoozedUntil,
      status: 'snoozed',
    });

    const after = new Date(2026, 7, 7, 12, 11, 0);
    expect(buildTodayReminders([medication], [reminder], [intake], after)[0]?.status).toBe('late');
  });

  it('keeps a skipped declaration without an available action status', () => {
    const now = new Date(2026, 7, 7, 7, 0, 0);
    const originalScheduledAt = new Date(2026, 7, 7, 8, 0, 0).toISOString();
    const intake: MedicationIntake = {
      id: 'intake-skipped',
      user_id: 'user-a',
      medication_id: medication.id,
      scheduled_at: originalScheduledAt,
      taken_at: null,
      status: 'skipped',
      snoozed_until: null,
      snooze_notification_id: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    expect(buildTodayReminders([medication], [reminder], [intake], now)[0]).toMatchObject({
      intakeId: 'intake-skipped',
      originalScheduledAt,
      status: 'skipped',
    });
  });
});
