import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useAuth } from '@/providers/auth-provider';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const shortcuts = [
  { title: 'Journal', description: 'Fonctionnalité à venir', route: '/(app)/(tabs)/journal' as const },
  { title: 'Médicaments', description: 'Fonctionnalité à venir', route: '/(app)/(tabs)/medications' as const },
  { title: 'Communauté', description: 'Fonctionnalité à venir', route: '/(app)/(tabs)/community' as const },
  { title: 'Profil', description: 'Voir mon profil', route: '/(app)/(tabs)/profile' as const },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <AppText variant="label" color="brand">DRÉPA</AppText>
        <AppText variant="title">Bienvenue dans ton espace</AppText>
        <AppText color="textSecondary">{user?.email ? 'Ton compte est prêt.' : 'Ton espace personnel.'}</AppText>
      </View>

      <StatusBanner tone="info" message="Les fonctionnalités seront ajoutées progressivement, avec une attention particulière à la confidentialité." />

      <Card>
        <View style={styles.cardContent}>
          <AppText variant="sectionTitle">Ton espace est prêt</AppText>
          <AppText color="textSecondary">Commence par explorer les sections disponibles. Aucun suivi médical n’est enregistré automatiquement.</AppText>
        </View>
      </Card>

      <View style={styles.section}>
        <AppText variant="sectionTitle">Accès rapides</AppText>
        <View style={styles.grid}>
          {shortcuts.map((shortcut) => (
            <Pressable
              key={shortcut.title}
              accessibilityRole="button"
              onPress={() => router.push(shortcut.route)}
              style={({ pressed }) => [styles.shortcut, { opacity: pressed ? 0.75 : 1 }]}
            >
              <Card>
                <AppText variant="label" color="brand">{shortcut.title}</AppText>
                <AppText variant="caption" color="textSecondary">{shortcut.description}</AppText>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxl, paddingBottom: spacing.xxxl },
  header: { gap: spacing.sm },
  cardContent: { gap: spacing.md },
  section: { gap: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  shortcut: { borderRadius: radii.xl, flexBasis: '47%', flexGrow: 1, minWidth: 140 },
});
