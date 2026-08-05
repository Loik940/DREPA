export type ScoreColorToken = 'textSecondary' | 'success' | 'warning' | 'sos';

export function getScoreColor(value: number | null): ScoreColorToken {
  if (value === null) return 'textSecondary';
  if (value <= 3) return 'success';
  if (value <= 6) return 'warning';
  return 'sos';
}
