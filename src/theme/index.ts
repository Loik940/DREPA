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

export type Theme = typeof theme;
