// Rappelle la limite médicale des échanges communautaires.
// Affiche le message de sécurité sans le raccourcir.
// Présente la charte même quand aucune action n’est fournie.
// Rend la charte interactive seulement avec un rappel parent.
// Utilise une carte et les tokens partagés de l’application.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing } from '@/theme/spacing';

const safetyMessage =
  'Les témoignages et échanges de la communauté ne remplacent pas l’avis d’un professionnel de santé.';

type CommunitySafetyBannerProps = {
  onOpenCharter?: () => void;
};

export function CommunitySafetyBanner({ onOpenCharter }: CommunitySafetyBannerProps) {
  return (
    <Card accessibilityLabel={safetyMessage} style={styles.card}>
      <AppText>{safetyMessage}</AppText>
      {onOpenCharter ? (
        <Button
          accessibilityHint="Ouvre la charte de la communauté."
          label="Lire la charte"
          onPress={onOpenCharter}
          variant="ghost"
          style={styles.action}
        />
      ) : (
        <View style={styles.staticLabel}>
          <AppText variant="label" color="brand">
            Charte de la communauté
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  action: { alignSelf: 'flex-start', paddingHorizontal: spacing.none },
  staticLabel: { justifyContent: 'center', minHeight: 44 },
});
