// Sélecteur de score accessible pour une valeur déclarée de douleur ou de fatigue.
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { getScoreTone } from './score';

type ScoreSelectorProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};

// Composant déclaratif : le score choisi décrit un ressenti et ne constitue ni une mesure clinique ni un diagnostic.
export function ScoreSelector({ label, value, onChange }: ScoreSelectorProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const scoreTone = getScoreTone(value);
  // Le niveau haut garde la couleur visuelle existante sans devenir un statut médical ou SOS.
  const scoreColorKey = scoreTone === 'high' ? 'sos' : scoreTone;
  const scoreHex = colors[scoreColorKey];

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
        accessibilityLabel={`${label}. Curseur de 0 à 10`}
        accessibilityRole="adjustable"
        accessibilityValue={{ min: 0, max: 10, now: value ?? undefined, text: value === null ? 'Non renseigné' : `${value} sur 10` }}
        onLayout={handleLayout}
        onPress={(event) => handleTrackPress(event.nativeEvent.locationX)}
        style={styles.track}
      >
        <View style={[styles.trackFill, { backgroundColor: scoreHex, width: value === null ? 0 : `${value * 10}%` }]} />
        {value !== null && <View style={[styles.thumb, { backgroundColor: scoreHex, left: `${value * 10}%` }]} />}
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
  track: { backgroundColor: colors.border, borderRadius: radii.full, height: 10, justifyContent: 'center', marginHorizontal: spacing.sm, overflow: 'visible' },
  trackFill: { borderRadius: radii.full, height: '100%' },
  thumb: { borderColor: colors.backgroundSurface, borderRadius: radii.full, borderWidth: 3, height: 28, marginLeft: -14, position: 'absolute', width: 28 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  resetButton: { alignSelf: 'center', minHeight: sizes.touchTarget, justifyContent: 'center', paddingHorizontal: spacing.md },
});
