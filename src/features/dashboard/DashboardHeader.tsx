// En-tête de l’accueil : affiche l’identité DRÉPA, la salutation et la date courante.
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { DashboardIcon } from './DashboardIcon';

type DashboardHeaderProps = {
  firstName?: string | null;
};

function getInitials(firstName?: string | null) {
  const value = firstName?.trim();
  return value ? value.slice(0, 2).toUpperCase() : 'DR';
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  const router = useRouter();
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
      <View style={styles.actions}>
        <Pressable
          accessibilityHint="Ouvre les rappels de médicaments"
          accessibilityLabel="Voir mes rappels"
          accessibilityRole="button"
          onPress={() => router.push('/(app)/(tabs)/medications')}
          style={({ pressed }) => [styles.reminders, { opacity: pressed ? 0.78 : 1 }]}
        >
          <DashboardIcon color={colors.brand} name="notification" />
        </Pressable>
        <Pressable
          accessibilityHint="Ouvre ton profil"
          accessibilityLabel="Ouvrir le profil"
          accessibilityRole="button"
          onPress={() => router.push('/(app)/(tabs)/profile')}
          style={({ pressed }) => [styles.avatar, { opacity: pressed ? 0.78 : 1 }]}
        >
          <AppText variant="label" color="brand" align="center">{getInitials(firstName)}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  identity: { flex: 1, gap: spacing.xs, minWidth: 180 },
  actions: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  reminders: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSurface,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.backgroundMuted,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: sizes.touchTarget,
    justifyContent: 'center',
    width: sizes.touchTarget,
  },
});
