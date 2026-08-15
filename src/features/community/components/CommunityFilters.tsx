// Affiche les filtres disponibles pour le fil communautaire.
// Utilise les libellés partagés de la fonctionnalité.
// Présente chaque choix sous forme de pastille accessible.
// Indique le filtre actif comme un bouton radio sélectionné.
// Applique uniquement les tokens du thème de l’application.
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';
import { communityFilterLabels, type CommunityFilter } from '../categories';

type CommunityFiltersProps = {
  value: CommunityFilter;
  onChange: (value: CommunityFilter) => void;
};

export function CommunityFilters({ value, onChange }: CommunityFiltersProps) {
  const { colors } = useAppTheme();

  return (
    <View accessibilityLabel="Filtres des publications" accessibilityRole="radiogroup" style={styles.container}>
      {communityFilterLabels.map((filter) => {
        const selected = value === filter.value;

        return (
          <Pressable
            key={filter.value}
            accessibilityLabel={`Filtrer par ${filter.label}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(filter.value)}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: selected ? colors.actionBg : colors.backgroundSurface,
                borderColor: selected ? colors.actionBg : colors.borderStrong,
                opacity: pressed ? 0.82 : 1,
              },
            ]}
          >
            <AppText variant="label" color={selected ? 'actionText' : 'textPrimary'}>
              {filter.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pill: {
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
  },
});
