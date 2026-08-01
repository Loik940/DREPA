import { useColorScheme } from 'react-native';

import { colors, type ColorScheme, type ThemeColors } from './colors';

export function useAppTheme(): { mode: ColorScheme; colors: ThemeColors } {
  const systemScheme = useColorScheme();
  const mode: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';

  return { mode, colors: colors[mode] };
}
