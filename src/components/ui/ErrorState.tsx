// État d’erreur partagé : affiche un message neutre et permet de relancer une requête.
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { AppText } from './AppText';
import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title = 'Impossible de charger ces informations', description, onRetry }: ErrorStateProps) {
  // Le rôle d’alerte signale l’erreur aux technologies d’assistance sans dépendre de sa couleur.
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <AppText variant="sectionTitle" align="center">{title}</AppText>
      <AppText color="textSecondary" align="center">{description}</AppText>
      {onRetry && <Button label="Réessayer" onPress={onRetry} style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, justifyContent: 'center', padding: spacing.xxl },
  button: { alignSelf: 'stretch', marginTop: spacing.sm },
});
