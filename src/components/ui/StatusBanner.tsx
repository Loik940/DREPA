// Bandeau d’état partagé pour les informations, succès, avertissements et erreurs neutres.
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

  // Chaque variante associe le message à une couleur d’état tout en gardant un fond calme et lisible.
  const palette = tone === 'success'
    ? { background: colors.backgroundMuted, text: colors.success }
    : tone === 'warning'
      ? { background: colors.warningSoft, text: colors.warningText }
      : tone === 'error'
        ? { background: colors.backgroundMuted, text: colors.sos }
        : { background: colors.backgroundMuted, text: colors.textPrimary };

  // Le rôle d’alerte permet aux technologies d’assistance d’annoncer le changement d’état.
  return (
    <View accessibilityLiveRegion={tone === 'error' ? 'assertive' : tone === 'success' ? 'polite' : 'none'} accessibilityRole={tone === 'error' ? 'alert' : undefined} style={[styles.banner, { backgroundColor: palette.background, borderLeftColor: palette.text }]}>
      <AppText color={palette.text === colors.success ? 'success' : palette.text === colors.warningText ? 'warningText' : palette.text === colors.sos ? 'sos' : 'textPrimary'}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderLeftWidth: 3, borderRadius: radii.md, padding: spacing.lg },
});
