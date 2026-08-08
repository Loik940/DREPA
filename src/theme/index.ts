// Export central du thème et du type Theme utilisé par les composants UI.
import { colors } from './colors';
import { radii } from './radii';
import { shadows } from './shadows';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { fontFamilies, fontWeights, typography } from './typography';

export { colors } from './colors';
export { radii } from './radii';
export { shadows } from './shadows';
export { sizes } from './sizes';
export { spacing } from './spacing';
export { fontFamilies, fontWeights, typography } from './typography';
export { useAppTheme } from './use-app-theme';

// Cet objet regroupe tous les tokens pour les usages qui ont besoin du thème complet.
export const theme = {
  colors,
  radii,
  shadows,
  sizes,
  spacing,
  fontFamilies,
  fontWeights,
  typography,
} as const;

// Le type structurant reste toujours aligné sur les tokens réellement exportés.
export type Theme = typeof theme;
