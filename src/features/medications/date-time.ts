// Ce fichier convertit les dates et les heures utilisées par le formulaire Médicaments.
// Il est utilisé par les sélecteurs natifs et leurs tests unitaires.
// Les valeurs manipulées restent des chaînes locales AAAA-MM-JJ ou HH:MM.
// Aucune donnée sensible, aucun secret et aucun accès réseau ne sont présents ici.
// Ces fonctions organisent des rappels sans interpréter ni modifier un traitement médical.

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// La construction composante par composante évite toute conversion implicite vers UTC.
export function parseLocalDate(value: string) {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new RangeError('La date locale doit utiliser le format AAAA-MM-JJ.');

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);

  // Cette vérification refuse les dates que JavaScript ferait déborder sur le mois suivant.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new RangeError('La date locale est invalide.');
  }

  return date;
}

export function formatLocalDate(value: Date) {
  assertValidDate(value);
  return `${value.getFullYear().toString().padStart(4, '0')}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

// Une date fixe locale rend la conversion d'heure déterministe et indépendante du jour courant.
export function parseLocalTime(value: string) {
  const match = TIME_PATTERN.exec(value);
  if (!match) throw new RangeError('L’heure locale doit utiliser le format HH:MM.');

  return new Date(1970, 0, 1, Number(match[1]), Number(match[2]), 0, 0);
}

export function formatLocalTime(value: Date) {
  assertValidDate(value);
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function assertValidDate(value: Date) {
  if (Number.isNaN(value.getTime())) throw new RangeError('La date fournie est invalide.');
}
