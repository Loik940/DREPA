// Tests des calculs et états de présentation utilisés par l’accueil.
import { buildDashboardSummary, flattenDashboardEntries, formatDashboardAverage, getLatestDashboardEntry } from './dashboard';

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
