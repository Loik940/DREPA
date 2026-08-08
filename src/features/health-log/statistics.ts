// Calculs descriptifs du Journal : moyennes, jours suivis et fréquences sans interprétation médicale.
import type { HealthLog } from './queries';

type StatisticsEntry = Pick<HealthLog, 'id' | 'pain_level' | 'fatigue_level' | 'symptoms' | 'possible_triggers' | 'medication_taken' | 'recorded_at'>;

export type HealthLogStatistics = {
  entryCount: number;
  trackedDays: number;
  averagePain: number | null;
  averageFatigue: number | null;
  medicationTakenCount: number;
  medicationTrackedCount: number;
  topSymptoms: { value: string; count: number }[];
  topTriggers: { value: string; count: number }[];
};

// Ces calculs résument uniquement les déclarations enregistrées. Ils ne posent aucun diagnostic et ne prédisent pas une crise.
function average(values: (number | null)[]) {
  const validValues = values.filter((value): value is number => value !== null);
  if (!validValues.length) return null;
  return Math.round((validValues.reduce((sum, value) => sum + value, 0) / validValues.length) * 10) / 10;
}

function frequencies(values: (string[] | null)[]) {
  const counts = new Map<string, number>();
  for (const list of values) {
    for (const value of list ?? []) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, 5);
}

export function calculateHealthLogStatistics(entries: StatisticsEntry[]): HealthLogStatistics {
  const medicationEntries = entries.filter((entry) => entry.medication_taken !== null);

  return {
    entryCount: entries.length,
    trackedDays: new Set(entries.map((entry) => entry.recorded_at.slice(0, 10))).size,
    averagePain: average(entries.map((entry) => entry.pain_level)),
    averageFatigue: average(entries.map((entry) => entry.fatigue_level)),
    medicationTakenCount: medicationEntries.filter((entry) => entry.medication_taken === true).length,
    medicationTrackedCount: medicationEntries.length,
    topSymptoms: frequencies(entries.map((entry) => entry.symptoms)),
    topTriggers: frequencies(entries.map((entry) => entry.possible_triggers)),
  };
}
