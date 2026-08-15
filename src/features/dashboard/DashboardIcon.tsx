// Pictogrammes locaux de l’accueil : dessinés avec des vues React Native pour rester visibles sans police d’icônes.
// Ils sont décoratifs ; les boutons parents portent toujours les libellés complets pour les lecteurs d’écran.
import { StyleSheet, View, type ColorValue } from 'react-native';

export type DashboardIconName = 'community' | 'home' | 'journal' | 'medication' | 'notification' | 'profile';

export function DashboardIcon({ color, name }: { color: ColorValue; name: DashboardIconName }) {
  if (name === 'journal') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.journal, { borderColor: color }]}>
        <View style={[styles.journalLineLong, { backgroundColor: color }]} />
        <View style={[styles.journalLineShort, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'medication') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.capsule, { borderColor: color }]}>
        <View style={[styles.capsuleDivider, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'community') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.community}>
        <View style={[styles.communityHead, styles.communityHeadLeft, { backgroundColor: color }]} />
        <View style={[styles.communityHead, styles.communityHeadCenter, { backgroundColor: color }]} />
        <View style={[styles.communityHead, styles.communityHeadRight, { backgroundColor: color }]} />
        <View style={[styles.communityBody, { borderColor: color }]} />
      </View>
    );
  }

  if (name === 'home') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.home}>
        <View style={[styles.homeRoof, { borderColor: color }]} />
        <View style={[styles.homeBody, { borderColor: color }]} />
      </View>
    );
  }

  if (name === 'notification') {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.notificationFrame}>
        <View style={[styles.bell, { borderColor: color }]} />
        <View style={[styles.clapper, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.profile}>
      <View style={[styles.profileHead, { backgroundColor: color }]} />
      <View style={[styles.profileBody, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  journal: { borderRadius: 3, borderWidth: 2, height: 24, justifyContent: 'center', paddingHorizontal: 4, width: 20 },
  journalLineLong: { borderRadius: 2, height: 2, marginBottom: 4, width: 9 },
  journalLineShort: { borderRadius: 2, height: 2, width: 6 },
  capsule: { borderRadius: 7, borderWidth: 2, height: 26, overflow: 'hidden', transform: [{ rotate: '40deg' }], width: 13 },
  capsuleDivider: { height: 2, left: 0, position: 'absolute', right: 0, top: 10 },
  community: { height: 24, position: 'relative', width: 28 },
  communityHead: { borderRadius: 999, height: 7, position: 'absolute', top: 2, width: 7 },
  communityHeadLeft: { left: 1, top: 5 },
  communityHeadCenter: { height: 9, left: 10, width: 9 },
  communityHeadRight: { right: 1, top: 5 },
  communityBody: { borderRadius: 999, borderTopWidth: 5, bottom: 1, height: 11, left: 2, position: 'absolute', right: 2 },
  home: { alignItems: 'center', height: 24, justifyContent: 'flex-end', width: 26 },
  homeRoof: { borderLeftWidth: 2, borderTopWidth: 2, height: 16, position: 'absolute', top: 1, transform: [{ rotate: '45deg' }], width: 16 },
  homeBody: { borderBottomLeftRadius: 3, borderBottomRightRadius: 3, borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, height: 13, width: 18 },
  notificationFrame: { alignItems: 'center', height: 24, justifyContent: 'flex-start', width: 24 },
  bell: { borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderTopLeftRadius: 9, borderTopRightRadius: 9, borderTopWidth: 2, height: 17, marginTop: 1, width: 16 },
  clapper: { borderRadius: 999, height: 4, marginTop: 1, width: 6 },
  profile: { alignItems: 'center', height: 24, width: 24 },
  profileHead: { borderRadius: 999, height: 9, width: 9 },
  profileBody: { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 2, height: 11, marginTop: 2, width: 19 },
});
