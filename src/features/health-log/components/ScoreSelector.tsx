import { ScrollView, StyleSheet, Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

type ScoreSelectorProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function ScoreSelector({ label, value, onChange }: ScoreSelectorProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      accessibilityLabel={label}
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: value === null }}
        onPress={() => onChange(null)}
        style={[styles.score, { backgroundColor: value === null ? colors.brand : colors.backgroundSurface, borderColor: colors.border }]}
      >
        <AppText variant="label" color={value === null ? 'onBrand' : 'textSecondary'}>Non renseigné</AppText>
      </Pressable>
      {Array.from({ length: 11 }, (_, score) => (
        <Pressable
          key={score}
          accessibilityRole="button"
          accessibilityState={{ selected: value === score }}
          accessibilityLabel={`${label} ${score} sur 10`}
          onPress={() => onChange(score)}
          style={[styles.score, styles.number, { backgroundColor: value === score ? colors.brand : colors.backgroundSurface, borderColor: colors.border }]}
        >
          <AppText variant="label" color={value === score ? 'onBrand' : 'textPrimary'}>{score}</AppText>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm },
  score: { alignItems: 'center', borderRadius: radii.full, borderWidth: 1, justifyContent: 'center', minHeight: sizes.touchTarget, paddingHorizontal: spacing.lg },
  number: { minWidth: sizes.touchTarget, paddingHorizontal: spacing.sm },
});
