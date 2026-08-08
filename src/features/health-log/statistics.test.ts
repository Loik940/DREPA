// Tests des statistiques descriptives calculées à partir des entrées du Journal.
import { calculateHealthLogStatistics } from './statistics';

const entries = [
  {
    id: 'entry-a',
    pain_level: 2,
    fatigue_level: 4,
    symptoms: ['fatigue', 'headache'],
    possible_triggers: ['stress'],
    medication_taken: true,
    recorded_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'entry-b',
    pain_level: 4,
    fatigue_level: null,
    symptoms: ['fatigue'],
    possible_triggers: ['stress', 'cold'],
    medication_taken: false,
    recorded_at: '2026-08-01T18:00:00.000Z',
  },
  {
    id: 'entry-c',
    pain_level: null,
    fatigue_level: 6,
    symptoms: null,
    possible_triggers: null,
    medication_taken: null,
    recorded_at: '2026-08-02T09:00:00.000Z',
  },
];

// Ces tests vérifient des résultats descriptifs, sans leur donner de portée médicale.
describe('health log statistics', () => {
  it('calculates descriptive averages and unique tracked days', () => {
    const result = calculateHealthLogStatistics(entries);
    expect(result.entryCount).toBe(3);
    expect(result.trackedDays).toBe(2);
    expect(result.averagePain).toBe(3);
    expect(result.averageFatigue).toBe(5);
  });

  it('counts declared medication answers without interpreting them', () => {
    const result = calculateHealthLogStatistics(entries);
    expect(result.medicationTrackedCount).toBe(2);
    expect(result.medicationTakenCount).toBe(1);
  });

  it('orders symptom and trigger frequencies', () => {
    const result = calculateHealthLogStatistics(entries);
    expect(result.topSymptoms[0]).toEqual({ value: 'fatigue', count: 2 });
    expect(result.topTriggers[0]).toEqual({ value: 'stress', count: 2 });
  });

  it('returns null averages for an empty history', () => {
    const result = calculateHealthLogStatistics([]);
    expect(result.averagePain).toBeNull();
    expect(result.averageFatigue).toBeNull();
  });
});
