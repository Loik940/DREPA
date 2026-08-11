// Vérifie le format français des dates communautaires.
// Fige l’heure courante pour garder des résultats stables.
// Couvre l’instant, les minutes, les heures et une date ancienne.
// Vérifie aussi tous les libellés de catégorie.
// Ces tests n’utilisent aucune dépendance React Native.
import { communityCategoryLabels } from './categories';
import { formatRelativeCommunityDate, getCommunityCategoryLabel } from './format';

describe('community formatters', () => {
  const now = new Date('2026-08-11T12:00:00.000Z');

  it('affiche les dates récentes avec un temps relatif simple', () => {
    expect(formatRelativeCommunityDate('2026-08-11T11:59:30.000Z', now)).toBe('À l’instant');
    expect(formatRelativeCommunityDate('2026-08-11T11:50:00.000Z', now)).toBe('Il y a 10 min');
    expect(formatRelativeCommunityDate('2026-08-11T09:00:00.000Z', now)).toBe('Il y a 3 h');
  });

  it('affiche une date courte pour un contenu ancien', () => {
    const expectedDate = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date('2026-08-09T12:00:00.000Z'));

    expect(formatRelativeCommunityDate('2026-08-09T12:00:00.000Z', now)).toBe(expectedDate);
  });

  it('retourne un texte vide pour une date invalide', () => {
    expect(formatRelativeCommunityDate('date-invalide', now)).toBe('');
  });

  it('retourne le libellé de chaque catégorie', () => {
    for (const category of communityCategoryLabels) {
      expect(getCommunityCategoryLabel(category.value)).toBe(category.label);
    }
  });
});
