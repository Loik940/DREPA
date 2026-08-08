// Champ texte partagé : gère label, valeur, aide, erreur et élément d’action à droite.
import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { AppText } from './AppText';

export type TextFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
  helperText?: string;
  rightElement?: ReactNode;
};

export function TextField({ label, error, helperText, rightElement, style, ...props }: TextFieldProps) {
  const { colors } = useAppTheme();
  const borderColor = error ? colors.sos : colors.border;

  // Le libellé transmis au lecteur d’écran reprend le label visible quand aucun autre texte n’est fourni.
  return (
    <View style={styles.wrapper}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.inputShell, { backgroundColor: colors.backgroundSurface, borderColor }]}>
        <TextInput
          {...props}
          accessibilityLabel={props.accessibilityLabel ?? label}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.textPrimary }, style]}
        />
        {rightElement}
      </View>
      {error ? <AppText variant="caption" color="sos">{error}</AppText> : helperText ? <AppText variant="caption" color="textSecondary">{helperText}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  inputShell: { alignItems: 'center', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', minHeight: sizes.inputHeight, paddingHorizontal: spacing.lg },
  input: { flex: 1, fontFamily: 'Inter', fontSize: 16, minHeight: sizes.inputHeight, paddingVertical: spacing.sm },
});
