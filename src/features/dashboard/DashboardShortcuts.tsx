// Grille de raccourcis de l’accueil vers les quatre fonctionnalités disponibles.
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { DashboardIcon, type DashboardIconName } from './DashboardIcon';

const shortcuts = [
  { title: 'Journal', description: 'Suivre mon état', symbol: 'journal', tone: 'brand', background: 'backgroundMuted', route: '/(app)/(tabs)/journal' as const },
  { title: 'Médicaments', description: 'Voir mes rappels', symbol: 'medication', tone: 'textPrimary', background: 'warningSoft', route: '/(app)/(tabs)/medications' as const },
  { title: 'Communauté', description: 'Échanger avec le groupe', symbol: 'community', tone: 'success', background: 'successSoft', route: '/(app)/(tabs)/community' as const },
  { title: 'Profil', description: 'Gérer mes informations', symbol: 'profile', tone: 'brand', background: 'backgroundMuted', route: '/(app)/(tabs)/profile' as const },
] as const satisfies readonly {
  title: string;
  description: string;
  symbol: DashboardIconName;
  tone: keyof typeof colors;
  background: keyof typeof colors;
  route: string;
}[];

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
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.symbol, { backgroundColor: colors[shortcut.background] }]}>
                <DashboardIcon color={colors[shortcut.tone]} name={shortcut.symbol} />
              </View>
              <AppText variant="body" style={styles.title}>{shortcut.title}</AppText>
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
  card: { borderRadius: radii.xl, gap: spacing.sm, minHeight: 148 },
  symbol: { alignItems: 'center', borderRadius: radii.lg, height: 48, justifyContent: 'center', width: 48 },
  title: { fontWeight: '700' },
});
