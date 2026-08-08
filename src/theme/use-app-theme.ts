// Hook de thème : expose la palette claire active dans le MVP DRÉPA.
import { colors, type ColorScheme, type ThemeColors } from './colors';

// Le choix reste volontairement fixé à la palette claire pour garder le rendu prévu sur tous les appareils.
export function useAppTheme(): { mode: ColorScheme; colors: ThemeColors } {
  return { mode: 'light', colors };
}
