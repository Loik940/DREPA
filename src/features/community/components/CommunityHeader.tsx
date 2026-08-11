// Affiche l’en-tête principal de la communauté.
// Présente un titre clair sans raccourci d’urgence.
// Propose l’action principale pour publier un message.
// Réutilise le bouton et les couleurs du design system.
// Transmet l’action de publication à l’écran parent.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme/spacing';

type CommunityHeaderProps = {
  onPublish: () => void;
};

export function CommunityHeader({ onPublish }: CommunityHeaderProps) {
  return (
    <View style={styles.container}>
      <AppText variant="title">Communauté</AppText>
      <Button
        accessibilityHint="Ouvre le formulaire de publication."
        label="Publier"
        onPress={onPublish}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  button: { minWidth: 112 },
});
