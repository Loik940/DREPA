// Calcul pur du ton visuel descriptif associé à un score du Journal.
export type ScoreTone = 'textSecondary' | 'success' | 'warning' | 'high';

// Le ton aide à lire un score déclaré, sans évaluer l’état de santé de la personne.
export function getScoreTone(value: number | null): ScoreTone {
  if (value === null) return 'textSecondary';
  if (value <= 3) return 'success';
  if (value <= 6) return 'warning';
  return 'high';
}
