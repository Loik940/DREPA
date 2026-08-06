// État de chargement partagé pour les écrans qui attendent une donnée serveur ou une session.
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/use-app-theme';
import { spacing } from '@/theme/spacing';
import { AppText } from './AppText';

export function LoadingState({ message = 'Chargement...' }: { message?: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand} />
      <AppText color="textSecondary" align="center">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, gap: spacing.md, justifyContent: 'center', padding: spacing.xxl },
});
