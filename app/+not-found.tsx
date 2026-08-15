// Route de secours : intercepte les liens inconnus ou devenus obsolètes.
// Elle n’affiche aucune donnée privée et propose un retour sûr vers l’entrée de l’application.
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { spacing } from '@/theme/spacing';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.content}>
        <AppText variant="title" align="center">Page introuvable</AppText>
        <AppText color="textSecondary" align="center">Ce lien n’est plus disponible ou n’appartient pas à DRÉPA.</AppText>
        <Button label="Revenir à l’accueil" onPress={() => router.replace('/')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  content: { gap: spacing.xxl },
});
