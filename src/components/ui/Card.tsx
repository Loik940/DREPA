// Surface partagée pour regrouper les informations avec les tokens de rayon et de thème.
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';

export function Card({ children, style, ...props }: ViewProps) {
  const { colors } = useAppTheme();

  return (
    <View {...props} style={[styles.card, { backgroundColor: colors.backgroundSurface, borderColor: colors.border }, shadows.none, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.xl, borderWidth: 1, padding: spacing.cardPadding },
});
