// Chips de choix du Journal pour les symptômes, facteurs, hydratation et prises déclarées.
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

type Choice = { label: string; value: string };

type ChoiceChipsProps = {
  choices: readonly Choice[];
  selected: string[];
  onChange: (selected: string[]) => void;
  single?: boolean;
  accessibilityLabel?: string;
  allowClear?: boolean;
};

type SingleChoiceChipsProps = {
  choices: readonly Choice[];
  selected: string | null;
  onChange: (selected: string | null) => void;
  accessibilityLabel?: string;
  allowClear?: boolean;
};

// Composants de sélection : ils recueillent des choix déclarés et ne suggèrent aucune cause médicale.
export function ChoiceChips({ choices, selected, onChange, single = false, accessibilityLabel, allowClear = false }: ChoiceChipsProps) {
  const { colors } = useAppTheme();

  const toggle = (value: string) => {
    if (single && selected.includes(value) && !allowClear) return;
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  return (
    <View accessibilityLabel={single ? accessibilityLabel ?? 'Choix unique' : accessibilityLabel} accessibilityRole={single ? 'radiogroup' : undefined} style={styles.container}>
      {choices.map((choice) => {
        const active = selected.includes(choice.value);
        return (
          <Pressable
            key={choice.value}
            accessibilityRole={single ? 'radio' : 'checkbox'}
            accessibilityState={{ checked: active }}
            onPress={() => toggle(choice.value)}
            style={[styles.chip, { backgroundColor: active ? colors.backgroundMuted : colors.backgroundSurface, borderColor: active ? colors.brand : colors.borderStrong }]}
          >
            <AppText variant="label" color={active ? 'brand' : 'textPrimary'}>{choice.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SingleChoiceChips({ choices, selected, onChange, accessibilityLabel, allowClear = false }: SingleChoiceChipsProps) {
  return (
    <ChoiceChips
      choices={choices}
      single
      accessibilityLabel={accessibilityLabel}
      allowClear={allowClear}
      selected={selected ? [selected] : []}
      onChange={(values) => onChange(values.at(-1) ?? null)}
    />
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderRadius: radii.full, borderWidth: 1, justifyContent: 'center', minHeight: sizes.touchTarget, paddingHorizontal: spacing.lg },
});
