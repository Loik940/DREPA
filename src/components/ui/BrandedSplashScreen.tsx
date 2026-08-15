// Écran de lancement affiché pendant la restauration initiale de DRÉPA.
// Il sert de repli bref si une préférence locale termine après la restauration Auth.
// Le logo, le nom et le slogan présentent l’identité « Terre et Sang ».
// Les trois points indiquent un vrai chargement, sans ajouter de délai artificiel.
// Il ne lit ni donnée médicale, ni information personnelle, ni secret local.
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { fontFamilies, fontWeights } from '@/theme/typography';

const DOT_KEYS = ['first', 'second', 'third'] as const;
const splashIcon = require('../../../assets/images/drepa-splash-icon.png') as ImageSourcePropType;

export function BrandedSplashScreen() {
  const reduceMotion = useReducedMotion();
  const [progress] = useState(() => DOT_KEYS.map(() => new Animated.Value(0)));

  // Le hook Reanimated suit le réglage Android sans ajouter de listener manuel dans ce composant.
  // Chaque point monte légèrement à son tour, puis toutes les animations sont arrêtées au démontage.
  useEffect(() => {
    if (reduceMotion) {
      progress.forEach((value) => value.setValue(0));
      return undefined;
    }

    const animations = progress.map((value, index) => Animated.loop(
      Animated.sequence([
        Animated.delay(index * 180),
        Animated.timing(value, {
          duration: 420,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          duration: 420,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay((DOT_KEYS.length - index - 1) * 180),
      ]),
    ));

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [progress, reduceMotion]);

  return (
    <View accessible accessibilityLabel="DRÉPA démarre" accessibilityLiveRegion="polite" accessibilityRole="progressbar" style={styles.container}>
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <View style={styles.identity}>
        <Image accessibilityIgnoresInvertColors accessible={false} source={splashIcon} style={styles.logo} />
        <Text style={styles.title}>DRÉPA</Text>
        <Text style={styles.slogan}>MA SANTÉ, MA FORCE, MA COMMUNAUTÉ.</Text>
      </View>

      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.dots}>
        {progress.map((value, index) => (
          <Animated.View
            key={DOT_KEYS[index]}
            style={[
              styles.dot,
              reduceMotion ? null : {
                opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
                transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.xxl,
  },
  glowTop: {
    backgroundColor: colors.splashBackgroundDeep,
    borderRadius: radii.full,
    height: 520,
    opacity: 0.36,
    position: 'absolute',
    right: -260,
    top: -230,
    width: 520,
  },
  glowBottom: {
    backgroundColor: colors.splashBackgroundDeep,
    borderRadius: radii.full,
    bottom: -240,
    height: 560,
    left: -280,
    opacity: 0.32,
    position: 'absolute',
    width: 560,
  },
  identity: { alignItems: 'center', flexShrink: 1, gap: spacing.lg },
  logo: { height: 140, width: 140 },
  title: {
    color: colors.splashText,
    fontFamily: fontFamilies.display,
    fontSize: 52,
    fontWeight: fontWeights.bold,
    letterSpacing: -1.2,
    lineHeight: 62,
  },
  slogan: {
    color: colors.splashTextMuted,
    fontFamily: fontFamilies.body,
    fontSize: 17,
    fontWeight: fontWeights.medium,
    letterSpacing: 1.1,
    lineHeight: 25,
    textAlign: 'center',
  },
  dots: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.huge },
  dot: { backgroundColor: colors.splashAccent, borderRadius: radii.full, height: 18, width: 18 },
});
