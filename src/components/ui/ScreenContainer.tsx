// Conteneur d’écran : fournit Safe Area, fond du thème, défilement et comportement clavier.
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/use-app-theme';
import { spacing } from '@/theme/spacing';

type ScreenContainerProps = ViewProps & {
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
};

export function ScreenContainer({ scroll = false, children, style, contentContainerStyle, ...props }: ScreenContainerProps) {
  const { colors } = useAppTheme();

  // La zone sûre et la gestion du clavier gardent le contenu accessible sur les différents écrans mobiles.
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[styles.safeArea, { backgroundColor: colors.backgroundPrimary }]}>
      {scroll ? (
        <ScrollView
          {...props}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          style={[styles.flex, style]}
        >
          {children}
        </ScrollView>
      ) : (
        <View {...props} style={[styles.container, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: spacing.screenGutter },
  scrollContent: { flexGrow: 1, padding: spacing.screenGutter },
});
