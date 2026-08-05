import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/theme/spacing';

export function ProfileContactSection() {
  return (
    <View style={styles.section}>
      <AppText variant="sectionTitle">Contacts d’urgence</AppText>
      <Card>
        <View style={styles.content}>
          <AppText variant="label">Contacts personnels</AppText>
          <AppText color="textSecondary">La gestion des contacts d’urgence sera ajoutée dans un prochain lot.</AppText>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  content: { gap: spacing.sm },
});
