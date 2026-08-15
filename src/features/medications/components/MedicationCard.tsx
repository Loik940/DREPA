// Carte d’un traitement saisi par l’utilisateur, sans recommandation ni dosage automatique.
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { DashboardIcon } from '@/features/dashboard/DashboardIcon';
import type { Medication } from '../queries';

// Composant d’affichage : il restitue le traitement saisi sans recommandation ni interprétation médicale.
export function MedicationCard({ medication, onPress }: { medication: Medication; onPress: () => void }) {
  return (
    <Pressable
      accessibilityHint="Ouvre le détail de ce traitement."
      accessibilityLabel={`${medication.name}, ${medication.dosage}, ${medication.frequency}, ${medication.is_active ? 'actif dans DRÉPA' : 'arrêté dans DRÉPA'}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.82 : 1 }]}
    >
      <Card style={styles.card}>
        <View style={styles.icon}>
          <DashboardIcon color={colors.brand} name="medication" />
        </View>
        <View style={styles.content}>
          <AppText variant="label">{medication.name}</AppText>
          <AppText color="textSecondary">{medication.dosage} · {medication.frequency}</AppText>
        </View>
        <View style={styles.status}>
          <AppText variant="caption" color={medication.is_active ? 'brand' : 'textSecondary'}>{medication.is_active ? 'Actif' : 'Arrêté'}</AppText>
        </View>
        <AppText color="textSecondary">→</AppText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { minHeight: 44 },
  card: { alignItems: 'center', flexDirection: 'row', gap: spacing.lg },
  icon: { alignItems: 'center', backgroundColor: colors.backgroundMuted, borderRadius: radii.lg, height: 64, justifyContent: 'center', width: 64 },
  content: { flex: 1, gap: spacing.xs },
  status: { borderColor: colors.border, borderRadius: radii.full, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
