import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import type { Profile } from '@/features/profile/queries';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/radii';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';

function getInitials(profile: Profile) {
  const value = profile.first_name?.trim();
  return value ? value.slice(0, 2).toUpperCase() : 'DR';
}

export function ProfileHeader({ profile }: { profile: Profile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(' · ');

  return (
    <Card style={styles.card}>
      <View style={styles.avatar} accessibilityLabel="Initiales du profil">
        <AppText variant="sectionTitle" color="brand" align="center">{getInitials(profile)}</AppText>
      </View>
      <AppText variant="title" align="center">{profile.first_name || 'Mon profil'}</AppText>
      <AppText color="textSecondary" align="center">{location || 'Localisation non renseignée'}</AppText>
      <AppText variant="caption" color="textSecondary" align="center">Les informations affichées sont celles de ton compte.</AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: spacing.sm, padding: spacing.xxl },
  avatar: { alignItems: 'center', backgroundColor: colors.backgroundMuted, borderColor: colors.border, borderRadius: radii.full, borderWidth: 1, height: sizes.avatarLarge, justifyContent: 'center', width: sizes.avatarLarge },
});
