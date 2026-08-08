// Carte d’un traitement saisi par l’utilisateur, sans recommandation ni dosage automatique.
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import type { Medication } from '../queries';

// Composant d’affichage : il restitue le traitement saisi sans recommandation ni interprétation médicale.
export function MedicationCard({ medication }: { medication: Medication }) {
  return (
    <Card style={styles.card}>
      <View style={styles.icon}>
        <SymbolView name={{ android: 'medication' }} size={28} tintColor={colors.brand} />
      </View>
      <View style={styles.content}>
        <AppText variant="label">{medication.name}</AppText>
        <AppText color="textSecondary">{medication.dosage} · {medication.frequency}</AppText>
      </View>
      <View style={styles.status}>
        <AppText variant="caption" color={medication.is_active ? 'brand' : 'textSecondary'}>{medication.is_active ? 'Actif' : 'Arrêté'}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', flexDirection: 'row', gap: spacing.lg },
  icon: { alignItems: 'center', backgroundColor: colors.backgroundMuted, borderRadius: radii.lg, height: 64, justifyContent: 'center', width: 64 },
  content: { flex: 1, gap: spacing.xs },
  status: { borderColor: colors.border, borderRadius: radii.full, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
