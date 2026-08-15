// Schéma Zod des traitements prescrits saisis par l’utilisateur et de leurs horaires de rappel.
import { z } from 'zod';
import { formatLocalDate, parseLocalDate } from './date-time';
import { countLocalDays, MAX_SCHEDULED_MEDICATION_NOTIFICATIONS } from './notification-schedule';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

// Contrats Zod : ils valident la saisie d’un traitement prescrit, sans inventer ni recommander médicament ou dosage.
export const medicationSchema = z
  .object({
    name: z.string().trim().min(1, 'Saisissez le nom du médicament.').max(120),
    dosage: z.string().trim().min(1, 'Saisissez le dosage prescrit.').max(120),
    frequency: z.string().trim().min(1, 'Saisissez la fréquence prescrite.').max(80),
    start_date: z.string().regex(datePattern, 'Utilisez le format AAAA-MM-JJ.'),
    end_date: z.string().trim().optional(),
    reminder_times: z.string().trim().max(80),
    reminders_enabled: z.boolean(),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((values, context) => {
    const parsedStart = parseDateSafely(values.start_date);
    const parsedEnd = values.end_date ? parseDateSafely(values.end_date) : null;

    if (datePattern.test(values.start_date) && !parsedStart) {
      context.addIssue({ code: 'custom', path: ['start_date'], message: 'La date de début est invalide.' });
    }

    if (values.end_date && (!datePattern.test(values.end_date) || !parsedEnd || (parsedStart && parsedEnd < parsedStart))) {
      context.addIssue({ code: 'custom', path: ['end_date'], message: 'La date de fin doit suivre la date de début.' });
    }

    if (values.reminders_enabled && parseReminderTimes(values.reminder_times).length === 0) {
      context.addIssue({ code: 'custom', path: ['reminder_times'], message: 'Ajoutez au moins une heure au format HH:MM.' });
    }

    if (values.reminders_enabled && parsedStart && parsedEnd) {
      const today = parseLocalDate(formatLocalDate(new Date()));
      const remainingDays = countLocalDays(new Date(Math.max(today.getTime(), parsedStart.getTime())), parsedEnd);
      const totalOccurrences = remainingDays * parseReminderTimes(values.reminder_times).length;
      if (totalOccurrences > MAX_SCHEDULED_MEDICATION_NOTIFICATIONS) {
        context.addIssue({
          code: 'custom',
          path: ['end_date'],
          message: `Limitez cette période à ${MAX_SCHEDULED_MEDICATION_NOTIFICATIONS} rappels planifiés au total.`,
        });
      }
    }

    if (values.reminder_times && values.reminder_times.split(',').some((time) => !timePattern.test(time.trim()))) {
      context.addIssue({ code: 'custom', path: ['reminder_times'], message: 'Utilisez des heures HH:MM séparées par des virgules.' });
    }
  });

export type MedicationValues = z.infer<typeof medicationSchema>;

export function parseReminderTimes(value: string) {
  return [...new Set(value.split(',').map((time) => time.trim()).filter((time) => timePattern.test(time)))].sort();
}

function parseDateSafely(value: string) {
  if (!datePattern.test(value)) return null;
  try {
    return parseLocalDate(value);
  } catch {
    return null;
  }
}

export const medicationDefaults: MedicationValues = {
  name: '',
  dosage: '',
  frequency: '',
  start_date: formatLocalDate(new Date()),
  end_date: '',
  reminder_times: '',
  reminders_enabled: false,
  notes: '',
};
