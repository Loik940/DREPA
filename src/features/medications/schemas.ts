// Schéma Zod des traitements prescrits saisis par l’utilisateur et de leurs horaires de rappel.
import { z } from 'zod';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    if (values.end_date && (!datePattern.test(values.end_date) || values.end_date < values.start_date)) {
      context.addIssue({ code: 'custom', path: ['end_date'], message: 'La date de fin doit suivre la date de début.' });
    }

    if (values.reminders_enabled && parseReminderTimes(values.reminder_times).length === 0) {
      context.addIssue({ code: 'custom', path: ['reminder_times'], message: 'Ajoutez au moins une heure au format HH:MM.' });
    }

    if (values.reminder_times && values.reminder_times.split(',').some((time) => !timePattern.test(time.trim()))) {
      context.addIssue({ code: 'custom', path: ['reminder_times'], message: 'Utilisez des heures HH:MM séparées par des virgules.' });
    }
  });

export type MedicationValues = z.infer<typeof medicationSchema>;

export function parseReminderTimes(value: string) {
  return [...new Set(value.split(',').map((time) => time.trim()).filter((time) => timePattern.test(time)))].sort();
}

export const medicationDefaults: MedicationValues = {
  name: '',
  dosage: '',
  frequency: '',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  reminder_times: '',
  reminders_enabled: false,
  notes: '',
};
