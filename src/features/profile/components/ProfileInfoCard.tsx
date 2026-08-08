// Carte Profil : présente les informations de suivi facultatives sans les interpréter médicalement.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import type { Profile } from '@/features/profile/queries';
import { spacing } from '@/theme/spacing';

type ProfileInfoCardProps = {
  profile: Profile;
};

const rows: { label: string; key: keyof Profile; declared?: boolean }[] = [
  { label: 'Type de drépanocytose', key: 'drepanocytosis_type' },
  { label: 'Groupe sanguin', key: 'blood_group', declared: true },
  { label: 'Allergies', key: 'allergies' },
  { label: 'Centre de suivi', key: 'care_center' },
  { label: 'Médecin référent', key: 'doctor_name' },
  { label: 'Téléphone du médecin', key: 'doctor_phone' },
];

export function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">Informations médicales</AppText>
      <Card>
        <View style={styles.cardContent}>
          {/* Chaque valeur est affichée telle qu'elle a été déclarée, sans déduction ni interprétation médicale. */}
          {rows.map((row) => {
            const value = profile[row.key];
            return (
              <View key={row.key} style={styles.row}>
                <AppText color="textSecondary">{row.label}</AppText>
                <View style={styles.value}>
                  <AppText align="right">{typeof value === 'string' && value.trim() ? value : 'Non renseigné'}</AppText>
                  {/* La mention rappelle explicitement l'origine déclarative des données concernées. */}
                  {row.declared && value && <AppText variant="caption" color="textSecondary" align="right">Déclaré par toi</AppText>}
                </View>
              </View>
            );
          })}
        </View>
      </Card>
      <AppText variant="caption" color="textSecondary">Ces informations sont déclarées par toi et ne constituent pas un document médical officiel.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  cardContent: { gap: spacing.lg },
  row: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.lg, justifyContent: 'space-between' },
  value: { flex: 1, gap: spacing.xs },
});
