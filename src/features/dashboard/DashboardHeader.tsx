// En-tête de l’accueil : affiche l’identité DRÉPA, la salutation et la date courante.
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

type DashboardHeaderProps = {
  firstName?: string | null;
};

function getInitials(firstName?: string | null) {
  const value = firstName?.trim();
  return value ? value.slice(0, 2).toUpperCase() : 'DR';
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <AppText variant="label" color="brand">DRÉPA</AppText>
        <AppText variant="title">Bonjour{firstName ? `, ${firstName}` : ''}</AppText>
        <AppText color="textSecondary">{date}</AppText>
      </View>
      <View accessibilityLabel="Identité DRÉPA" style={styles.avatar}>
        <AppText variant="label" color="brand" align="center">{getInitials(firstName)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  identity: { flex: 1, gap: spacing.xs },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.backgroundMuted,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.avatar,
    justifyContent: 'center',
    width: sizes.avatar,
  },
});
