import { calculateHealthLogStatistics, type HealthLogStatistics } from '@/features/health-log/statistics';
import type { HealthLog } from '@/features/health-log/queries';

export type DashboardSummary = HealthLogStatistics;
export type DashboardEntry = Pick<HealthLog, 'id' | 'pain_level' | 'fatigue_level' | 'symptoms' | 'possible_triggers' | 'medication_taken' | 'recorded_at'>;

export function flattenDashboardEntries(data: { pages?: readonly DashboardEntry[][] } | undefined) {
  return data?.pages?.flat() ?? [];
}

export function getLatestDashboardEntry(entries: DashboardEntry[]) {
  return entries[0] ?? null;
}

export function buildDashboardSummary(entries: DashboardEntry[]): DashboardSummary | null {
  if (!entries.length) {
    return null;
  }

  return calculateHealthLogStatistics(entries);
}

export function formatDashboardAverage(value: number | null) {
  return value === null ? '—' : `${value}/10`;
}
