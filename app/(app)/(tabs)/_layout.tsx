// Navigation principale : déclare les cinq onglets de l’espace authentifié.
import { Tabs } from 'expo-router';

import { DashboardIcon, type DashboardIconName } from '@/features/dashboard/DashboardIcon';
import { useAppTheme } from '@/theme/use-app-theme';
import { fontFamilies } from '@/theme/typography';

const tabIcons = {
  index: 'home',
  journal: 'journal',
  medications: 'medication',
  community: 'community',
  profile: 'profile',
} as const satisfies Record<string, DashboardIconName>;

export default function TabsLayout() {
  // Le hook charge les couleurs utilisées par la barre de navigation.
  const { colors } = useAppTheme();

  // Le rendu principal déclare les onglets et leurs icônes.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: fontFamilies.semiBold, fontSize: 13 },
        tabBarStyle: { backgroundColor: colors.backgroundSurface, borderTopColor: colors.borderStrong, minHeight: 74, paddingBottom: 8, paddingTop: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} name={tabIcons.index} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} name={tabIcons.journal} />,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: 'Médicaments',
          tabBarLabel: 'Médicaments',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} name={tabIcons.medications} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Communauté',
          tabBarLabel: 'Communauté',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} name={tabIcons.community} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} name={tabIcons.profile} />,
        }}
      />
    </Tabs>
  );
}
