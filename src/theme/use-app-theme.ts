import { colors, type ColorScheme, type ThemeColors } from './colors';

export function useAppTheme(): { mode: ColorScheme; colors: ThemeColors } {
  return { mode: 'light', colors };
}
