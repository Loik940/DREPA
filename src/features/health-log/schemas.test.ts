// Tests de validation des entrées partielles du Journal.
import { healthLogDefaults, healthLogSchema } from './schemas';

describe('health log schema', () => {
  it('accepts a partial entry with no health measurement', () => {
    expect(healthLogSchema.parse(healthLogDefaults)).toEqual(healthLogDefaults);
  });

  it('accepts the valid score boundaries', () => {
    expect(healthLogSchema.parse({ ...healthLogDefaults, pain_level: 0, fatigue_level: 10 })).toMatchObject({
      pain_level: 0,
      fatigue_level: 10,
    });
  });

  it('rejects scores outside zero to ten', () => {
    expect(() => healthLogSchema.parse({ ...healthLogDefaults, pain_level: 11 })).toThrow();
    expect(() => healthLogSchema.parse({ ...healthLogDefaults, fatigue_level: -1 })).toThrow();
  });

  it('accepts an optional decimal temperature written with a comma', () => {
    expect(healthLogSchema.parse({ ...healthLogDefaults, temperature: '37,2' }).temperature).toBe('37,2');
  });

  it('rejects a future recorded date', () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    expect(() => healthLogSchema.parse({ ...healthLogDefaults, recorded_at: tomorrow })).toThrow();
  });

  it('limits notes to two thousand characters', () => {
    expect(() => healthLogSchema.parse({ ...healthLogDefaults, notes: 'a'.repeat(2001) })).toThrow();
  });
});
