// Grille de raccourcis de l’accueil vers les onglets et fonctionnalités disponibles ou futures.
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

const shortcuts = [
  { title: 'Journal', description: 'Ouvrir le journal', symbol: 'J', route: '/(app)/(tabs)/journal' as const },
  { title: 'Médicaments', description: 'Bientôt disponible', symbol: 'M', route: '/(app)/(tabs)/medications' as const },
  { title: 'Communauté', description: 'Bientôt disponible', symbol: 'C', route: '/(app)/(tabs)/community' as const },
  { title: 'Profil', description: 'Voir mes informations', symbol: 'P', route: '/(app)/(tabs)/profile' as const },
];

export function DashboardShortcuts() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AppText variant="sectionTitle">Accès rapides</AppText>
      <View style={styles.grid}>
        {shortcuts.map((shortcut) => (
          <Pressable
            accessibilityHint={shortcut.description}
            accessibilityRole="button"
            accessibilityLabel={`${shortcut.title}. ${shortcut.description}`}
            key={shortcut.title}
            onPress={() => router.push(shortcut.route)}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.82 : 1 }]}
          >
            <Card style={styles.card}>
              <View accessibilityLabel={`${shortcut.title} repère`} style={styles.symbol}>
                <AppText variant="label" color="brand" align="center">{shortcut.symbol}</AppText>
              </View>
              <AppText variant="label">{shortcut.title}</AppText>
              <AppText variant="caption" color="textSecondary">{shortcut.description}</AppText>
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  item: { flexBasis: '47%', flexGrow: 1, minWidth: 140 },
  card: { borderRadius: radii.xl, gap: spacing.sm, minHeight: 132 },
  symbol: { alignItems: 'center', backgroundColor: colors.backgroundMuted, borderRadius: radii.full, height: 36, justifyContent: 'center', width: 36 },
});
