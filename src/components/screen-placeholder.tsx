// État générique d’attente, d’erreur ou de fonctionnalité différée avec action optionnelle.
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ScreenPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ScreenPlaceholder({ title, description, actionLabel, onAction }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  action: {
    alignItems: 'center',
    backgroundColor: '#208AEF',
    borderRadius: 8,
    padding: 14,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
