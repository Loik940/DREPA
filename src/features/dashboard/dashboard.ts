// Fonctions pures de l’accueil : aplatir le cache Journal et produire des résumés descriptifs.
import { calculateHealthLogStatistics, type HealthLogStatistics } from '@/features/health-log/statistics';
import type { HealthLog } from '@/features/health-log/queries';

export type DashboardSummary = HealthLogStatistics;
export type DashboardEntry = Pick<HealthLog, 'id' | 'pain_level' | 'fatigue_level' | 'symptoms' | 'possible_triggers' | 'medication_taken' | 'recorded_at'>;

// Les pages du cache sont seulement aplaties ; aucune donnée de santé n'est ajoutée ou corrigée ici.
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

  // Le résumé réutilise uniquement des calculs descriptifs et ne produit aucune conclusion médicale.
  return calculateHealthLogStatistics(entries);
}

// Une valeur absente reste explicitement non renseignée au lieu d'inventer une moyenne.
export function formatDashboardAverage(value: number | null) {
  return value === null ? '—' : `${value}/10`;
}
