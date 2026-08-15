// Fonctions pures de l’accueil : aplatir le cache Journal et produire des résumés descriptifs.
import { calculateHealthLogStatistics, type HealthLogStatistics } from '@/features/health-log/statistics';
import type { HealthLog } from '@/features/health-log/queries';
import type { TodayReminder } from '@/features/medications/status';

export type DashboardSummary = HealthLogStatistics;
export type DashboardEntry = Pick<HealthLog, 'id' | 'pain_level' | 'fatigue_level' | 'symptoms' | 'possible_triggers' | 'medication_taken' | 'recorded_at'>;

// Les pages du cache sont seulement aplaties ; aucune donnée de santé n'est ajoutée ou corrigée ici.
export function flattenDashboardEntries(data: { pages?: readonly DashboardEntry[][] } | undefined) {
  return data?.pages?.flat() ?? [];
}

export function getLatestDashboardEntry(entries: DashboardEntry[]) {
  return entries[0] ?? null;
}

// L’entrée du jour est comparée dans le fuseau local du téléphone afin de respecter la date vue par l’utilisateur.
export function getTodayDashboardEntry(entries: DashboardEntry[], now = new Date()) {
  return entries.find((entry) => {
    const recordedAt = new Date(entry.recorded_at);
    return !Number.isNaN(recordedAt.getTime())
      && recordedAt.getFullYear() === now.getFullYear()
      && recordedAt.getMonth() === now.getMonth()
      && recordedAt.getDate() === now.getDate();
  }) ?? null;
}

export function getActionableDashboardReminder(reminders: TodayReminder[]) {
  return reminders.find((item) => item.status === 'late' || item.status === 'pending' || item.status === 'snoozed');
}

// Les messages distinguent l’état réseau des rappels réels sans confirmer qu’un traitement a été pris.
export function getDashboardMedicationDescription(
  reminder: TodayReminder | undefined,
  reminderCount: number,
  pending: boolean,
  error: boolean,
) {
  if (pending) return 'Chargement des rappels...';
  if (error) return 'Rappels indisponibles';
  if (!reminder) return reminderCount ? 'Consulter les rappels du jour' : 'Aucun rappel actif aujourd’hui';
  if (reminder.status === 'late') return 'Un rappel est en attente';
  if (reminder.status === 'snoozed') return `Reporté à ${formatDashboardTime(reminder.scheduledAt)}`;
  return `Prochain rappel à ${formatDashboardTime(reminder.scheduledAt)}`;
}

function formatDashboardTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'heure indisponible'
    : new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
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
