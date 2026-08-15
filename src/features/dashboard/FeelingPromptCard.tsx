// Carte d’appel à l’action qui ouvre le formulaire du Journal sans créer de donnée seule.
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

const splashIcon = require('../../../assets/images/drepa-splash-icon.png') as ImageSourcePropType;

export function FeelingPromptCard() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityHint="Ouvre le journal de santé"
      accessibilityRole="button"
      accessibilityLabel="Enregistrer ton état du jour"
      onPress={() => router.push('/(app)/health-entry')}
      style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.82 : 1 }]}
    >
      <Card style={styles.card}>
        <View pointerEvents="none" style={styles.glowTop} />
        <View pointerEvents="none" style={styles.glowBottom} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <AppText variant="label" color="splashText">AUJOURD’HUI</AppText>
            </View>
            <Image accessibilityIgnoresInvertColors accessible={false} source={splashIcon} style={styles.illustration} />
          </View>
          <AppText variant="title" color="onBrand">Comment te sens-tu aujourd’hui ?</AppText>
          <AppText color="splashTextMuted">Prends un instant pour noter ce que tu souhaites suivre.</AppText>
          <View style={styles.actionRow}>
            <AppText variant="button" color="brand" style={styles.actionLabel}>Enregistrer mon état</AppText>
            <AppText variant="button" color="brand">→</AppText>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { minHeight: sizes.buttonHeight },
  card: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
    borderRadius: radii.xxl,
    minHeight: 276,
    overflow: 'hidden',
    padding: spacing.xxl,
  },
  glowTop: {
    backgroundColor: colors.splashBackgroundDeep,
    borderRadius: radii.full,
    height: 230,
    opacity: 0.48,
    position: 'absolute',
    right: -110,
    top: -130,
    width: 230,
  },
  glowBottom: {
    backgroundColor: colors.actionBg,
    borderRadius: radii.full,
    bottom: -105,
    height: 190,
    opacity: 0.2,
    position: 'absolute',
    right: 38,
    width: 190,
  },
  content: { gap: spacing.md, zIndex: 1 },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, justifyContent: 'space-between' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.splashPanelSoft,
    borderColor: colors.splashPanelBorder,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  illustration: { height: 68, width: 68 },
  actionRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.splashText,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    minHeight: sizes.buttonHeight,
    paddingHorizontal: spacing.lg,
  },
  actionLabel: { flexShrink: 1 },
});
