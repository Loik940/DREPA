// Tests des calculs et états de présentation utilisés par l’accueil.
import type { TodayReminder } from '@/features/medications/status';
import {
  buildDashboardSummary,
  flattenDashboardEntries,
  formatDashboardAverage,
  getActionableDashboardReminder,
  getDashboardMedicationDescription,
  getLatestDashboardEntry,
  getTodayDashboardEntry,
} from './dashboard';

const entries = [
  {
    id: 'entry-1',
    user_id: 'user-1',
    pain_level: 4,
    pain_location: null,
    temperature: null,
    hydration_level: null,
    fatigue_level: 2,
    symptoms: [],
    possible_triggers: [],
    medication_taken: true,
    notes: null,
    recorded_at: '2026-08-04T08:00:00.000Z',
    created_at: '2026-08-04T08:00:00.000Z',
    updated_at: '2026-08-04T08:00:00.000Z',
  },
];

describe('dashboard calculations', () => {
  it('flattens journal pages and keeps the latest entry first', () => {
    const data = { pages: [entries, []] };

    expect(flattenDashboardEntries(data)).toHaveLength(1);
    expect(getLatestDashboardEntry(flattenDashboardEntries(data))?.id).toBe('entry-1');
  });

  it('does not create a summary when there are no journal entries', () => {
    expect(buildDashboardSummary([])).toBeNull();
  });

  it('finds only an entry recorded on the local day', () => {
    const now = new Date(2026, 7, 4, 12, 0, 0);
    const localEntry = { ...entries[0], recorded_at: new Date(2026, 7, 4, 8, 0, 0).toISOString() };

    expect(getTodayDashboardEntry([localEntry], now)?.id).toBe('entry-1');
    expect(getTodayDashboardEntry([localEntry], new Date(2026, 7, 5, 12, 0, 0))).toBeNull();
  });

  it('describes partial medication states without inventing a reminder', () => {
    expect(getDashboardMedicationDescription(undefined, 0, true, false)).toBe('Chargement des rappels...');
    expect(getDashboardMedicationDescription(undefined, 0, false, true)).toBe('Rappels indisponibles');
    expect(getDashboardMedicationDescription(undefined, 0, false, false)).toBe('Aucun rappel actif aujourd’hui');
    expect(getDashboardMedicationDescription(undefined, 2, false, false)).toBe('Consulter les rappels du jour');
  });

  it('selects and describes the first actionable reminder', () => {
    const scheduledAt = new Date(2026, 7, 4, 18, 30, 0).toISOString();
    const reminder = {
      status: 'pending',
      scheduledAt,
    } as TodayReminder;

    expect(getActionableDashboardReminder([{ ...reminder, status: 'taken' }, reminder])).toBe(reminder);
    expect(getDashboardMedicationDescription(reminder, 2, false, false)).toContain('Prochain rappel à');
    expect(getDashboardMedicationDescription({ ...reminder, status: 'late' }, 1, false, false)).toBe('Un rappel est en attente');
    expect(getDashboardMedicationDescription({ ...reminder, status: 'snoozed' }, 1, false, false)).toContain('Reporté à');
  });

  it('calculates only descriptive values from journal entries', () => {
    const summary = buildDashboardSummary(entries);

    expect(summary?.trackedDays).toBe(1);
    expect(summary?.averagePain).toBe(4);
    expect(summary?.medicationTakenCount).toBe(1);
    expect(formatDashboardAverage(summary?.averagePain ?? null)).toBe('4/10');
  });

  it('represents an undeclared value without inventing a number', () => {
    expect(formatDashboardAverage(null)).toBe('—');
  });
});
