import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';

export function DashboardLoadingState() {
  return (
    <View accessibilityLabel="Chargement de l’accueil" style={styles.loading}>
      <ActivityIndicator color={colors.brand} size="large" />
      <AppText color="textSecondary">Chargement de ton espace...</AppText>
    </View>
  );
}

export function DashboardErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card style={styles.errorCard}>
      <AppText variant="sectionTitle">Accueil indisponible</AppText>
      <AppText color="textSecondary">{message}</AppText>
      <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
        <AppText variant="button" color="actionText" align="center">Réessayer</AppText>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', flex: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.xxl },
  errorCard: { borderColor: colors.sos, gap: spacing.md },
  retry: { backgroundColor: colors.actionBg, borderRadius: radii.lg, minHeight: 52, justifyContent: 'center', padding: spacing.md },
});
