// État générique d’attente, d’erreur ou de fonctionnalité différée avec action optionnelle.
import { Pressable, StyleSheet, Text, View, type AccessibilityRole } from 'react-native';

import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type ScreenPlaceholderProps = {
  title: string;
  description: string;
  actionLabel?: string;
  accessibilityRole?: AccessibilityRole;
  loading?: boolean;
  onAction?: () => void;
};

export function ScreenPlaceholder({ title, description, actionLabel, accessibilityRole, loading = false, onAction }: ScreenPlaceholderProps) {
  return (
    <View accessibilityLiveRegion={loading ? 'polite' : 'none'} accessibilityRole={loading ? 'progressbar' : accessibilityRole} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.actionBg,
    borderRadius: radii.lg,
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
    padding: spacing.md,
  },
  actionText: {
    ...typography.button,
    color: colors.actionText,
  },
});
