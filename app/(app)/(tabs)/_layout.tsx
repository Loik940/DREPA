import { Tabs } from 'expo-router';

import { useAppTheme } from '@/theme/use-app-theme';

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: 'Inter', fontSize: 12, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.backgroundSurface, borderTopColor: colors.border, height: 68 },
      }}
    />
  );
}
