// Planification pure des rappels Android selon les dates locales déclarées du traitement.
// Une période finie ou sans fin produit uniquement des occurrences ponctuelles dans une fenêtre bornée.
import { formatLocalDate, parseLocalDate, parseLocalTime } from './date-time';

export type MedicationNotificationSchedule = {
  mode: 'dated';
  occurrences: { date: Date; identifier: string }[];
  seriesId: string;
};

export const MAX_SCHEDULED_MEDICATION_NOTIFICATIONS = 366;
export const ROLLING_REMINDER_WINDOW_DAYS = 30;

export function buildMedicationNotificationSchedule(
  medicationId: string,
  time: string,
  startDate: string,
  endDate: string | null,
  now = new Date(),
): MedicationNotificationSchedule {
  const parsedTime = parseLocalTime(time);
  const start = parseLocalDate(startDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const seriesId = `drepa-med:${medicationId}:${time.replace(':', '')}`;

  const rollingEnd = new Date(today);
  rollingEnd.setDate(rollingEnd.getDate() + ROLLING_REMINDER_WINDOW_DAYS - 1);
  const declaredEnd = endDate ? parseLocalDate(endDate) : rollingEnd;
  const end = new Date(Math.min(declaredEnd.getTime(), rollingEnd.getTime()));
  const cursor = new Date(Math.max(start.getTime(), today.getTime()));
  const occurrences: MedicationNotificationSchedule['occurrences'] = [];
  const occurrenceCount = countLocalDays(cursor, end);
  if (occurrenceCount > MAX_SCHEDULED_MEDICATION_NOTIFICATIONS) {
    throw new RangeError(`Une série ne peut pas dépasser ${MAX_SCHEDULED_MEDICATION_NOTIFICATIONS} rappels planifiés.`);
  }

  // setDate respecte les changements de mois et d’heure locale contrairement à un ajout fixe de 24 heures.
  while (cursor.getTime() <= end.getTime()) {
    const date = new Date(cursor);
    date.setHours(parsedTime.getHours(), parsedTime.getMinutes(), 0, 0);
    if (date.getTime() > now.getTime()) {
      occurrences.push({ date, identifier: `${seriesId}:${formatLocalDate(cursor)}` });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { mode: 'dated', occurrences, seriesId };
}

export function countLocalDays(start: Date, end: Date) {
  if (end.getTime() < start.getTime()) return 0;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / 86_400_000) + 1;
}

export function assertMedicationNotificationBudget(
  medicationId: string,
  times: string[],
  startDate: string,
  endDate: string | null,
  now = new Date(),
) {
  if (times.length * ROLLING_REMINDER_WINDOW_DAYS > MAX_SCHEDULED_MEDICATION_NOTIFICATIONS) {
    throw new RangeError(`Le traitement ne peut pas dépasser ${MAX_SCHEDULED_MEDICATION_NOTIFICATIONS} notifications planifiées.`);
  }
  let total = 0;
  for (const time of times) {
    const schedule = buildMedicationNotificationSchedule(medicationId, time, startDate, endDate, now);
    total += schedule.occurrences.length;
    if (total > MAX_SCHEDULED_MEDICATION_NOTIFICATIONS) {
      throw new RangeError(`Le traitement ne peut pas dépasser ${MAX_SCHEDULED_MEDICATION_NOTIFICATIONS} notifications planifiées.`);
    }
  }
}
