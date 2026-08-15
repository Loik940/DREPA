// Icône œil locale : indique la visibilité du mot de passe sans dépendre d’une police Android.
// Elle reste décorative car le bouton parent fournit le libellé complet à TalkBack.
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/colors';

export function VisibilityIcon({ hidden }: { hidden: boolean }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.frame}>
      <View style={styles.eye}>
        <View style={styles.pupil} />
      </View>
      {hidden ? <View style={styles.slash} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignItems: 'center', height: 24, justifyContent: 'center', width: 28 },
  eye: { alignItems: 'center', borderColor: colors.textSecondary, borderRadius: 14, borderWidth: 2, height: 16, justifyContent: 'center', width: 26 },
  pupil: { backgroundColor: colors.textSecondary, borderRadius: 999, height: 7, width: 7 },
  slash: { backgroundColor: colors.textSecondary, height: 2, position: 'absolute', transform: [{ rotate: '-42deg' }], width: 30 },
});
