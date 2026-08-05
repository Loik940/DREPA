import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

export function FeelingPromptCard() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityHint="Ouvre le journal de santé"
      accessibilityRole="button"
      accessibilityLabel="Enregistrer ton état du jour"
      onPress={() => router.push('/(app)/(tabs)/journal')}
      style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.82 : 1 }]}
    >
      <Card style={styles.card}>
        <View style={styles.badge}>
          <AppText variant="label" color="brand">AUJOURD’HUI</AppText>
        </View>
        <AppText variant="sectionTitle">Comment te sens-tu aujourd’hui ?</AppText>
        <AppText color="textSecondary">Enregistre ton état quand tu es prêt, sans saisie automatique.</AppText>
        <View style={styles.actionRow}>
          <AppText variant="button" color="brand">Enregistrer mon état</AppText>
          <AppText variant="button" color="brand">→</AppText>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { minHeight: sizes.buttonHeight },
  card: { borderColor: colors.brand, borderRadius: radii.xxl, gap: spacing.md, padding: spacing.xxl },
  badge: { alignSelf: 'flex-start', backgroundColor: colors.backgroundMuted, borderRadius: radii.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  actionRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
});
