// Liste des paramètres Profil : expose les réglages disponibles et marque les fonctions différées.
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type ProfileSettingsListProps = {
  onLegal: () => void;
};

const settings = [
  { label: 'Notifications', value: 'Bientôt disponible', enabled: false },
  { label: 'Confidentialité', value: 'Bientôt disponible', enabled: false },
  { label: "Conditions d'utilisation", value: '', enabled: true },
  { label: 'À propos de DRÉPA', value: 'Bientôt disponible', enabled: false },
] as const;

export function ProfileSettingsList({ onLegal }: ProfileSettingsListProps) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">Paramètres</AppText>
      <Card>
        <View style={styles.list}>
          {settings.map((setting) => {
            const content = (
              <View style={styles.row}>
                <AppText color={setting.enabled ? 'textPrimary' : 'textSecondary'}>{setting.label}</AppText>
                <AppText variant="caption" color="textSecondary">{setting.value || '→'}</AppText>
              </View>
            );

            return setting.enabled ? (
              <Pressable accessibilityRole="button" key={setting.label} onPress={onLegal} style={styles.pressable}>
                {content}
              </Pressable>
            ) : (
              <View key={setting.label} style={styles.pressable}>{content}</View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  list: { gap: spacing.xs },
  pressable: { borderBottomColor: colors.border, borderBottomWidth: 1, minHeight: 52, justifyContent: 'center', paddingVertical: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
