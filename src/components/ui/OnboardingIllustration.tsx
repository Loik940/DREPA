import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { radii } from '@/theme/radii';

type OnboardingIllustrationProps = {
  variant: 'calm' | 'together' | 'steady';
};

export function OnboardingIllustration({ variant }: OnboardingIllustrationProps) {
  const { colors } = useAppTheme();

  return (
    <View accessible accessibilityLabel="Illustration d’accompagnement DRÉPA" style={[styles.canvas, { backgroundColor: colors.backgroundMuted }]}>
      {variant === 'calm' && <CalmIllustration colors={colors} />}
      {variant === 'together' && <TogetherIllustration colors={colors} />}
      {variant === 'steady' && <SteadyIllustration colors={colors} />}
    </View>
  );
}

type IllustrationColors = ReturnType<typeof useAppTheme>['colors'];

function CalmIllustration({ colors }: { colors: IllustrationColors }) {
  return (
    <View style={styles.centered}>
      <View style={[styles.sun, { backgroundColor: colors.actionBg }]} />
      <View style={[styles.head, { backgroundColor: colors.brand }]} />
      <View style={[styles.body, { backgroundColor: colors.brand }]} />
      <View style={[styles.waterDrop, { backgroundColor: colors.success }]} />
      <View style={[styles.ground, { backgroundColor: colors.border }]} />
    </View>
  );
}

function TogetherIllustration({ colors }: { colors: IllustrationColors }) {
  return (
    <View style={styles.centered}>
      <View style={[styles.connection, { backgroundColor: colors.actionBg }]} />
      <View style={[styles.headSmall, styles.personLeft, { backgroundColor: colors.brand }]} />
      <View style={[styles.bodySmall, styles.personLeftBody, { backgroundColor: colors.brand }]} />
      <View style={[styles.headSmall, styles.personRight, { backgroundColor: colors.success }]} />
      <View style={[styles.bodySmall, styles.personRightBody, { backgroundColor: colors.success }]} />
      <View style={[styles.ground, { backgroundColor: colors.border }]} />
    </View>
  );
}

function SteadyIllustration({ colors }: { colors: IllustrationColors }) {
  return (
    <View style={styles.centered}>
      <View style={[styles.phone, { backgroundColor: colors.backgroundSurface, borderColor: colors.brand }]}>
        <View style={[styles.phoneSpeaker, { backgroundColor: colors.border }]} />
        <View style={[styles.phoneCard, { backgroundColor: colors.backgroundMuted }]} />
        <View style={[styles.phoneLine, { backgroundColor: colors.brand }]} />
        <View style={[styles.phoneLineShort, { backgroundColor: colors.actionBg }]} />
        <View style={[styles.phoneCheck, { backgroundColor: colors.success }]} />
      </View>
      <View style={[styles.supportCircle, { backgroundColor: colors.actionBg }]} />
      <View style={[styles.ground, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { alignItems: 'center', borderRadius: radii.xxl, height: 240, justifyContent: 'center', overflow: 'hidden', width: 240 },
  centered: { alignItems: 'center', height: 220, justifyContent: 'center', position: 'relative', width: 220 },
  sun: { borderRadius: radii.full, height: 84, opacity: 0.3, position: 'absolute', right: 22, top: 24, width: 84 },
  head: { borderRadius: radii.full, height: 58, position: 'absolute', top: 48, width: 58 },
  body: { borderTopLeftRadius: 48, borderTopRightRadius: 48, bottom: 34, height: 86, position: 'absolute', width: 112 },
  waterDrop: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderTopLeftRadius: 24, borderTopRightRadius: 4, bottom: 42, height: 30, position: 'absolute', right: 36, transform: [{ rotate: '45deg' }], width: 30 },
  ground: { borderRadius: radii.full, bottom: 22, height: 10, opacity: 0.8, position: 'absolute', width: 156 },
  connection: { borderRadius: radii.full, height: 72, opacity: 0.35, position: 'absolute', top: 70, width: 150 },
  headSmall: { borderRadius: radii.full, height: 46, position: 'absolute', top: 50, width: 46 },
  bodySmall: { borderTopLeftRadius: 34, borderTopRightRadius: 34, bottom: 38, height: 72, position: 'absolute', width: 82 },
  personLeft: { left: 34 },
  personLeftBody: { left: 16 },
  personRight: { right: 34 },
  personRightBody: { right: 16 },
  phone: { borderRadius: 22, borderWidth: 3, height: 134, justifyContent: 'flex-start', padding: 14, position: 'absolute', top: 34, width: 88 },
  phoneSpeaker: { alignSelf: 'center', borderRadius: radii.full, height: 5, width: 26 },
  phoneCard: { borderRadius: 10, height: 44, marginTop: 16, width: '100%' },
  phoneLine: { borderRadius: radii.full, height: 7, marginTop: 12, width: '75%' },
  phoneLineShort: { borderRadius: radii.full, height: 7, marginTop: 8, width: '50%' },
  phoneCheck: { borderRadius: radii.full, bottom: 14, height: 18, position: 'absolute', right: 12, width: 18 },
  supportCircle: { borderRadius: radii.full, bottom: 50, height: 48, opacity: 0.35, position: 'absolute', right: 30, width: 48 },
});
