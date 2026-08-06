// Hook de thème : expose la palette claire active dans le MVP DRÉPA.
import { colors, type ColorScheme, type ThemeColors } from './colors';

export function useAppTheme(): { mode: ColorScheme; colors: ThemeColors } {
  return { mode: 'light', colors };
}
