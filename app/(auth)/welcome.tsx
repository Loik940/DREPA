// Onboarding visuel de bienvenue : présente DRÉPA avant l’inscription ou la connexion.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { OnboardingIllustration } from '@/components/ui/OnboardingIllustration';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';
import { WELCOME_SEEN_KEY } from '../index';

const slides = [
  {
    eyebrow: 'DRÉPA',
    title: 'Suis ta santé au quotidien',
    description: 'Un espace simple pour organiser ton suivi personnel, à ton rythme.',
    shape: 'calm',
  },
  {
    eyebrow: 'SOUTIEN',
    title: 'Tu n’es pas seul',
    description: 'Un projet pensé pour créer un lien entre expérience, écoute et communauté.',
    shape: 'together',
  },
  {
    eyebrow: 'ACCOMPAGNEMENT',
    title: 'Un espace qui te ressemble',
    description: 'Des outils utiles pour avancer avec plus de clarté et de sérénité.',
    shape: 'steady',
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const finish = async (destination: '/(auth)/login' | '/(auth)/register') => {
    await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
    router.replace(destination);
  };

  const next = () => {
    if (index < slides.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    void finish('/(auth)/register');
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="label" color="brand">DRÉPA</AppText>
        <Pressable accessibilityRole="button" onPress={() => void finish('/(auth)/login')} style={styles.skip}>
          <AppText variant="label" color="textSecondary">Passer</AppText>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <OnboardingIllustration variant={slide.shape} />
      </View>

      <View style={styles.copy}>
        <AppText variant="label" color="brand" align="center">{slide.eyebrow}</AppText>
        <AppText variant="title" align="center">{slide.title}</AppText>
        <AppText color="textSecondary" align="center" style={styles.description}>{slide.description}</AppText>
      </View>

      <View style={styles.footer}>
        <View accessibilityLabel={`Étape ${index + 1} sur ${slides.length}`} style={styles.dots}>
          {slides.map((item, itemIndex) => (
            <View key={item.eyebrow} style={[styles.dot, { backgroundColor: itemIndex === index ? colors.brand : colors.border }]} />
          ))}
        </View>
        <Button label={index === slides.length - 1 ? 'Commencer' : 'Continuer'} onPress={next} />
        {index === slides.length - 1 ? (
          <Pressable accessibilityRole="link" onPress={() => void finish('/(auth)/login')} style={styles.accountLink}>
            <AppText variant="label" color="brand" align="center">J’ai déjà un compte</AppText>
          </Pressable>
        ) : (
          <Link href="/(auth)/login" onPress={() => void AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true')} style={styles.accountLink}>
            <AppText variant="label" color="textSecondary" align="center">J’ai déjà un compte</AppText>
          </Link>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between', minHeight: '100%', paddingBottom: spacing.xxl, paddingTop: spacing.lg },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  skip: { minHeight: spacing.touchTarget, justifyContent: 'center', paddingHorizontal: spacing.sm },
  hero: { alignItems: 'center', justifyContent: 'center', minHeight: 280, paddingVertical: spacing.xxl },
  copy: { gap: spacing.md },
  description: { alignSelf: 'center', maxWidth: 320 },
  footer: { gap: spacing.lg, paddingTop: spacing.xxxl },
  dots: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  dot: { borderRadius: radii.full, height: 8, width: 8 },
  accountLink: { alignSelf: 'center', minHeight: spacing.touchTarget, justifyContent: 'center', paddingHorizontal: spacing.sm },
});
