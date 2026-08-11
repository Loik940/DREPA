// Affiche l’action de soutien d’une publication.
// Distingue clairement un soutien déjà envoyé.
// Montre le compteur réel fourni par les données.
// Désactive l’action pendant son chargement.
// Utilise seulement le vocabulaire du soutien.
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';

type SupportButtonProps = {
  supported: boolean;
  count: number;
  loading: boolean;
  onPress: () => void;
};

export function SupportButton({ supported, count, loading, onPress }: SupportButtonProps) {
  const { colors } = useAppTheme();
  const label = supported ? 'Soutenu' : 'Soutenir';

  return (
    <Pressable
      accessibilityLabel={`${label}, ${count} soutien${count === 1 ? '' : 's'}`}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading, selected: supported }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: supported ? colors.backgroundMuted : colors.backgroundSurface,
          borderColor: supported ? colors.brand : colors.border,
          opacity: loading ? 0.55 : pressed ? 0.82 : 1,
        },
      ]}
    >
      <AppText variant="label" color={supported ? 'brand' : 'textPrimary'}>
        {label} · {count}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
  },
});
