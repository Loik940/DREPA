// Construction pure des rappels du jour à partir des traitements, horaires et prises déclarées.
import type { Medication, MedicationIntake, MedicationReminder } from './queries';

export type ReminderDisplayStatus = 'late' | 'pending' | 'taken' | 'snoozed' | 'skipped';

export type TodayReminder = {
  medication: Medication;
  reminder: MedicationReminder;
  scheduledAt: string;
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
  return reminders
    .filter((reminder) => reminder.is_enabled)
    .flatMap((reminder) => {
      const medication = medications.find((item) => item.id === reminder.medication_id && item.is_active);
      if (!medication) return [];
      const [hour, minute] = reminder.reminder_time.slice(0, 5).split(':').map(Number);
      const scheduled = new Date(now);
      scheduled.setHours(hour, minute, 0, 0);
      const intake = intakes.find((item) => item.medication_id === medication.id && sameMinute(item.scheduled_at, scheduled));
      const status: ReminderDisplayStatus = intake?.status ?? (scheduled.getTime() < now.getTime() ? 'late' : 'pending');
      return [{ medication, reminder, scheduledAt: scheduled.toISOString(), status }];
    })
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

function sameMinute(value: string, expected: Date) {
  const date = new Date(value);
  return date.getFullYear() === expected.getFullYear()
    && date.getMonth() === expected.getMonth()
    && date.getDate() === expected.getDate()
    && date.getHours() === expected.getHours()
    && date.getMinutes() === expected.getMinutes();
}
