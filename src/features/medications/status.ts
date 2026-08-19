// Construction pure des rappels du jour à partir des traitements, horaires et prises déclarées.
import type { Medication, MedicationIntake, MedicationReminder } from './queries';

export type ReminderDisplayStatus = 'late' | 'pending' | 'taken' | 'snoozed' | 'skipped';

export type TodayReminder = {
  displayId: string;
  medication: Medication;
  reminder: MedicationReminder;
  intakeId: string | null;
  originalScheduledAt: string;
  scheduledAt: string;
  snoozeNotificationId: string | null;
  snoozedUntil: string | null;
  status: ReminderDisplayStatus;
};

// Calculs et statuts : ils organisent les horaires déclarés, sans confirmer une prise ni donner de consigne médicale.
export function getTodayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function buildTodayReminders(medications: Medication[], reminders: MedicationReminder[], intakes: MedicationIntake[], now = new Date()): TodayReminder[] {
  const localDay = formatLocalDay(now);
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const currentReminders = reminders
    .filter((reminder) => reminder.is_enabled)
    .flatMap((reminder) => {
      const medication = medications.find((item) => item.id === reminder.medication_id
        && item.is_active
        && item.start_date <= localDay
        && (!item.end_date || item.end_date >= localDay));
      if (!medication) return [];
      const [hour, minute] = reminder.reminder_time.slice(0, 5).split(':').map(Number);
      const scheduled = new Date(now);
      scheduled.setHours(hour, minute, 0, 0);
      const intake = intakes.find((item) => item.medication_id === medication.id && sameMinute(item.scheduled_at, scheduled));
      const originalScheduledAt = scheduled.toISOString();
      const snoozedUntil = intake?.status === 'snoozed' && intake.snoozed_until
        ? new Date(intake.snoozed_until)
        : null;
      const effectiveSchedule = snoozedUntil ?? scheduled;
      const status: ReminderDisplayStatus = snoozedUntil
        ? effectiveSchedule.getTime() > now.getTime() ? 'snoozed' : 'late'
        : intake?.status ?? (scheduled.getTime() < now.getTime() ? 'late' : 'pending');
      return [{
        displayId: `${reminder.id}:${originalScheduledAt}`,
        medication,
        reminder,
        intakeId: intake?.id ?? null,
        originalScheduledAt,
        scheduledAt: effectiveSchedule.toISOString(),
        snoozeNotificationId: intake?.snooze_notification_id ?? null,
        snoozedUntil: intake?.snoozed_until ?? null,
        status,
      }];
    });

  const carryoverReminders = intakes.flatMap((intake) => {
    if (intake.status !== 'snoozed' || !intake.snoozed_until) return [];
    const original = new Date(intake.scheduled_at);
    if (original.getTime() >= dayStart.getTime() || new Date(intake.snoozed_until).getTime() < dayStart.getTime()) return [];
    const medication = medications.find((item) => item.id === intake.medication_id && item.is_active);
    if (!medication) return [];
    const reminder = reminders.find((item) => {
      if (item.medication_id !== intake.medication_id || !item.is_enabled) return false;
      const [hour, minute] = item.reminder_time.slice(0, 5).split(':').map(Number);
      return original.getHours() === hour && original.getMinutes() === minute;
    });
    if (!reminder) return [];
    const effectiveSchedule = new Date(intake.snoozed_until);
    return [{
      displayId: intake.id,
      medication,
      reminder,
      intakeId: intake.id,
      originalScheduledAt: intake.scheduled_at,
      scheduledAt: effectiveSchedule.toISOString(),
      snoozeNotificationId: intake.snooze_notification_id,
      snoozedUntil: intake.snoozed_until,
      status: effectiveSchedule.getTime() > now.getTime() ? 'snoozed' as const : 'late' as const,
    }];
  });

  return [...currentReminders, ...carryoverReminders]
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

function formatLocalDay(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function sameMinute(value: string, expected: Date) {
  const date = new Date(value);
  return date.getFullYear() === expected.getFullYear()
    && date.getMonth() === expected.getMonth()
    && date.getDate() === expected.getDate()
    && date.getHours() === expected.getHours()
    && date.getMinutes() === expected.getMinutes();
}
