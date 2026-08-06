// Case à cocher accessible utilisée pour les consentements et choix booléens.
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { AppText } from './AppText';

type CheckboxRowProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
};

export function CheckboxRow({ checked, label, onChange, error, disabled = false }: CheckboxRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        disabled={disabled}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View style={[styles.box, { borderColor: checked ? colors.brand : colors.border, backgroundColor: checked ? colors.brand : colors.backgroundSurface }]}>
          {checked && <AppText color="onBrand" variant="label">✓</AppText>}
        </View>
        <AppText style={styles.label}>{label}</AppText>
      </Pressable>
      {error && <AppText variant="caption" color="sos">{error}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, minHeight: sizes.touchTarget },
  box: { alignItems: 'center', borderRadius: radii.sm, borderWidth: 1, height: 24, justifyContent: 'center', width: 24 },
  label: { flex: 1 },
});
