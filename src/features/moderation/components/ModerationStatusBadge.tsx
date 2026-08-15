// Affiche le statut lisible d’un signalement.
// Associe chaque statut à une couleur du thème.
// Garde le texte visible en plus de la couleur.
// Fournit un libellé clair au lecteur d’écran.
// Utilise une forme compacte sans réduire la lisibilité.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { radii } from '@/theme/radii';
import { spacing } from '@/theme/spacing';
import { useAppTheme } from '@/theme/use-app-theme';
import type { ModerationStatus } from '../types';

type ModerationStatusBadgeProps = {
  status: ModerationStatus;
};

const statusPresentation = {
  pending: { label: 'En attente', textColor: 'warningText', backgroundColor: 'warningSoft' },
  reviewed: { label: 'Traité', textColor: 'success', backgroundColor: 'successSoft' },
  dismissed: { label: 'Rejeté', textColor: 'textSecondary', backgroundColor: 'backgroundMuted' },
} as const;

export function ModerationStatusBadge({ status }: ModerationStatusBadgeProps) {
  const { colors } = useAppTheme();
  const presentation = statusPresentation[status];

  return (
    <View
      accessible
      accessibilityLabel={`Statut : ${presentation.label}`}
      style={[styles.badge, { backgroundColor: colors[presentation.backgroundColor] }]}
    >
      <AppText variant="caption" color={presentation.textColor}>
        {presentation.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
