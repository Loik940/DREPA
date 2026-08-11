// Formate les dates du fil avec des mots français simples.
// Affiche les minutes et les heures pour les contenus récents.
// Utilise une date courte pour les contenus plus anciens.
// Traduit les catégories techniques en libellés lisibles.
// Ces fonctions restent pures et indépendantes de React Native.
import { communityCategoryLabels, type CommunityCategory } from './categories';

const shortFrenchDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatRelativeCommunityDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const elapsedMilliseconds = Math.max(0, now.getTime() - date.getTime());
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);
  if (elapsedMinutes < 1) return 'À l’instant';
  if (elapsedMinutes < 60) return `Il y a ${elapsedMinutes} min`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `Il y a ${elapsedHours} h`;

  return shortFrenchDateFormatter.format(date);
}

export function getCommunityCategoryLabel(category: CommunityCategory): string {
  return communityCategoryLabels.find((item) => item.value === category)?.label ?? category;
}
