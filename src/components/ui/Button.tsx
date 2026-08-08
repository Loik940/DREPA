// Bouton partagé : gère les variantes visuelles, le chargement, l’état désactivé et l’accessibilité.
import { Pressable, StyleSheet, ActivityIndicator, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ButtonVariant = 'primary' | 'brand' | 'secondary' | 'ghost' | 'danger';

// Les variantes gardent la même API tout en distinguant les actions principales, discrètes et dangereuses.
type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({ label, variant = 'primary', loading = false, disabled, style, textStyle, ...props }: ButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;
  const palette = getPalette(variant, colors);

  // Les états désactivé et occupé sont exposés aux technologies d’assistance en plus du rendu visuel.
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, borderColor: palette.border, opacity: isDisabled ? 0.55 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={palette.text} /> : <Text style={[styles.text, { color: palette.text }, textStyle]}>{label}</Text>}
    </Pressable>
  );
}

// La palette traduit chaque intention du bouton avec les couleurs sémantiques du thème.
function getPalette(variant: ButtonVariant, colors: ReturnType<typeof useAppTheme>['colors']) {
  if (variant === 'brand') return { background: colors.brand, border: colors.brand, text: colors.onBrand };
  if (variant === 'danger') return { background: colors.sos, border: colors.sos, text: colors.onSos };
  if (variant === 'secondary') return { background: 'transparent', border: colors.brand, text: colors.brand };
  if (variant === 'ghost') return { background: 'transparent', border: 'transparent', text: colors.brand };
  return { background: colors.actionBg, border: colors.actionBg, text: colors.actionText };
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', borderRadius: radii.lg, borderWidth: 1, justifyContent: 'center', minHeight: sizes.buttonHeight, paddingHorizontal: spacing.xl },
  text: { ...typography.button, textAlign: 'center' },
});
