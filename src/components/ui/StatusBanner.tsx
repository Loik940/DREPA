import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { AppText } from './AppText';

type StatusBannerProps = {
  message: string;
  tone?: 'info' | 'success' | 'warning' | 'error';
};

export function StatusBanner({ message, tone = 'info' }: StatusBannerProps) {
  const { colors } = useAppTheme();
  const palette = tone === 'success'
    ? { background: colors.backgroundMuted, text: colors.success }
    : tone === 'warning'
      ? { background: colors.backgroundMuted, text: colors.warning }
      : tone === 'error'
        ? { background: colors.backgroundMuted, text: colors.sos }
        : { background: colors.backgroundMuted, text: colors.textPrimary };

  return (
    <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: palette.background, borderLeftColor: palette.text }]}>
      <AppText color={palette.text === colors.success ? 'success' : palette.text === colors.warning ? 'warning' : palette.text === colors.sos ? 'sos' : 'textPrimary'}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderLeftWidth: 3, borderRadius: radii.md, padding: spacing.lg },
});
