import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { typography } from '@/theme/typography';

type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  color?: keyof ReturnType<typeof useAppTheme>['colors'];
  align?: TextStyle['textAlign'];
};

export function AppText({ variant = 'body', color = 'textPrimary', align, style, ...props }: AppTextProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      {...props}
      style={[typography[variant], styles.base, { color: colors[color], textAlign: align }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
