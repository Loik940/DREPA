// Calcul pur du token de couleur descriptif associé à un score du Journal.
export type ScoreColorToken = 'textSecondary' | 'success' | 'warning' | 'sos';

// Calcul de statut visuel : la couleur aide à lire un score déclaré, sans évaluer l’état de santé de la personne.
export function getScoreColor(value: number | null): ScoreColorToken {
  if (value === null) return 'textSecondary';
  if (value <= 3) return 'success';
  if (value <= 6) return 'warning';
  return 'sos';
}
