// Ce fichier teste les conversions locales de date et d’heure du module Médicaments.
// Il protège les sélecteurs contre les décalages involontaires liés à UTC.
// Toutes les valeurs utilisées sont synthétiques et indépendantes d’un utilisateur réel.
// Aucun secret, accès réseau ou stockage de donnée n’est nécessaire à ces tests.
// Les cas vérifiés ne contiennent aucune prescription, aucun médicament et aucun dosage.
import { formatLocalDate, formatLocalTime, parseLocalDate, parseLocalTime } from './date-time';

describe('medication local date and time helpers', () => {
  it('formats a date with local calendar parts', () => {
    expect(formatLocalDate(new Date(2026, 7, 8, 23, 45))).toBe('2026-08-08');
  });

  it('parses a local date without changing its day', () => {
    const date = parseLocalDate('2026-08-08');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(8);
    expect(date.getHours()).toBe(0);
  });

  it('formats an hour with a 24-hour clock', () => {
    expect(formatLocalTime(new Date(2026, 7, 8, 6, 5))).toBe('06:05');
  });

  it('parses a local hour without changing it', () => {
    const time = parseLocalTime('21:07');

    expect(time.getHours()).toBe(21);
    expect(time.getMinutes()).toBe(7);
  });

  it('round-trips local values without an UTC conversion', () => {
    expect(formatLocalDate(parseLocalDate('2026-01-02'))).toBe('2026-01-02');
    expect(formatLocalTime(parseLocalTime('00:15'))).toBe('00:15');
  });
});
