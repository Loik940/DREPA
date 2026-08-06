// Tests de conversion des champs Journal vers le payload PostgreSQL.
import { buildHealthLogPayload } from './payload';
import { healthLogDefaults } from './schemas';

describe('health log payload', () => {
  it('normalizes empty optional values to null', () => {
    expect(buildHealthLogPayload(healthLogDefaults)).toEqual({
      pain_level: null,
      pain_location: null,
      temperature: null,
      hydration_level: null,
      fatigue_level: null,
      symptoms: null,
      possible_triggers: null,
      medication_taken: null,
      notes: null,
    });
  });

  it('converts a comma decimal temperature and preserves false', () => {
    expect(buildHealthLogPayload({ ...healthLogDefaults, temperature: '37,2', medication_taken: false })).toMatchObject({
      temperature: 37.2,
      medication_taken: false,
    });
  });

  it('includes recorded_at only when explicitly provided', () => {
    const recordedAt = '2026-08-03T12:00:00.000Z';
    expect(buildHealthLogPayload({ ...healthLogDefaults, recorded_at: recordedAt })).toMatchObject({ recorded_at: recordedAt });
    expect(buildHealthLogPayload(healthLogDefaults)).not.toHaveProperty('recorded_at');
  });
});
