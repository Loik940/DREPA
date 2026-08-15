// Texte partagé : applique les variantes typographiques et les couleurs du thème DRÉPA.
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { typography } from '@/theme/typography';

// Les clés du thème limitent les variantes et couleurs aux choix cohérents du design system.
type AppTextProps = TextProps & {
  variant?: keyof typeof typography;
  color?: keyof ReturnType<typeof useAppTheme>['colors'];
  align?: TextStyle['textAlign'];
};

export function AppText({ variant = 'body', color = 'textPrimary', align, style, accessibilityLiveRegion, accessibilityRole, ...props }: AppTextProps) {
  const { colors } = useAppTheme();

  return (
    <Text
      {...props}
      accessibilityRole={accessibilityRole ?? (variant === 'title' ? 'header' : undefined)}
      accessibilityLiveRegion={accessibilityRole === 'alert' ? 'assertive' : accessibilityLiveRegion}
      style={[typography[variant], styles.base, { color: colors[color], textAlign: align }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
