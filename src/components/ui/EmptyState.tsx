// État vide partagé : explique l’absence normale de données et propose une action facultative.
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/spacing';
import { AppText } from './AppText';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="sectionTitle" align="center">{title}</AppText>
      <AppText color="textSecondary" align="center">{description}</AppText>
      {actionLabel && onAction && <Button label={actionLabel} onPress={onAction} style={styles.button} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.md, justifyContent: 'center', padding: spacing.xxl },
  button: { alignSelf: 'stretch', marginTop: spacing.sm },
});
