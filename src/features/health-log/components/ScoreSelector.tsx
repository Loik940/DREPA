// Sélecteur de score accessible pour une valeur déclarée de douleur ou de fatigue.
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

type ScoreSelectorProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};

// Composant déclaratif : le score choisi décrit un ressenti et ne constitue ni une mesure clinique ni un diagnostic.
export function ScoreSelector({ label, value, onChange }: ScoreSelectorProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const scoreColorKey = 'brand' as const;
  const scoreHex = colors.brand;

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const handleTrackPress = (locationX: number) => {
    if (!trackWidth) return;
    const nextValue = Math.round(Math.max(0, Math.min(locationX, trackWidth)) / trackWidth * 10);
    onChange(nextValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.valueRow}>
        <AppText variant="label" color="textSecondary">{label}</AppText>
        <AppText variant="display" color={scoreColorKey}>{value ?? '—'}</AppText>
      </View>
      <Pressable
        accessibilityActions={[{ name: 'increment', label: 'Augmenter' }, { name: 'decrement', label: 'Diminuer' }]}
        accessibilityLabel={`${label}. Curseur de 0 à 10`}
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 0, max: 10, now: value ?? undefined, text: value === null ? 'Non renseigné' : `${value} sur 10` }}
        onLayout={handleLayout}
        onAccessibilityAction={(event) => {
          const current = value ?? 0;
          if (event.nativeEvent.actionName === 'increment') onChange(Math.min(10, current + 1));
          if (event.nativeEvent.actionName === 'decrement') onChange(Math.max(0, current - 1));
        }}
        onPress={(event) => handleTrackPress(event.nativeEvent.locationX)}
        style={styles.trackTarget}
      >
        <View style={[styles.track, { backgroundColor: colors.borderStrong }]}>
          <View style={[styles.trackFill, { backgroundColor: scoreHex, width: value === null ? 0 : `${value * 10}%` }]} />
          {value !== null && <View style={[styles.thumb, { backgroundColor: scoreHex, left: `${value * 10}%` }]} />}
        </View>
      </Pressable>
      <View style={styles.scaleLabels}>
        <AppText variant="caption" color="textSecondary">Aucune</AppText>
        <AppText variant="caption" color="textSecondary">Très forte</AppText>
      </View>
      <Pressable accessibilityRole="button" onPress={() => onChange(null)} style={styles.resetButton}>
        <AppText variant="caption" color={value === null ? 'brand' : 'textSecondary'}>Non renseigné</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  valueRow: { alignItems: 'center', gap: spacing.xs },
  trackTarget: { justifyContent: 'center', minHeight: sizes.touchTarget, paddingHorizontal: spacing.sm },
  track: { borderRadius: radii.full, height: 10, justifyContent: 'center', overflow: 'visible' },
  trackFill: { borderRadius: radii.full, height: '100%' },
  thumb: { borderColor: colors.backgroundSurface, borderRadius: radii.full, borderWidth: 3, height: 28, marginLeft: -14, position: 'absolute', width: 28 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  resetButton: { alignSelf: 'center', minHeight: sizes.touchTarget, justifyContent: 'center', paddingHorizontal: spacing.md },
});
