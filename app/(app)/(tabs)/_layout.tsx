import { Tabs } from 'expo-router';
import { SymbolView, type AndroidSymbol } from 'expo-symbols';

import { useAppTheme } from '@/theme/use-app-theme';

const tabIcons = {
  index: 'home',
  journal: 'edit_note',
  medications: 'medication',
  community: 'groups',
  profile: 'person',
} as const satisfies Record<string, AndroidSymbol>;

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
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => <SymbolView name={{ android: tabIcons.index }} size={size} tintColor={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color, size }) => <SymbolView name={{ android: tabIcons.journal }} size={size} tintColor={color} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Médicaments',
          tabBarLabel: 'Médicaments',
          tabBarIcon: ({ color, size }) => <SymbolView name={{ android: tabIcons.medications }} size={size} tintColor={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Communauté',
          tabBarLabel: 'Communauté',
          tabBarIcon: ({ color, size }) => <SymbolView name={{ android: tabIcons.community }} size={size} tintColor={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <SymbolView name={{ android: tabIcons.profile }} size={size} tintColor={color} />,
        }}
      />
    </Tabs>
  );
}
