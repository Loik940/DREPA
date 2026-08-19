// Configuration Expo Android et EAS : identité, plugins, assets, schéma et projet distant.
module.exports = {
  name: 'DREPA',
  slug: 'drepa',
  version: '1.0.0',
  platforms: ['android'],
  orientation: 'portrait',
  scheme: 'drepa',
  userInterfaceStyle: 'light',
  icon: './assets/images/icon.png',
  android: {
    package: 'bj.drepa.app',
    softwareKeyboardLayoutMode: 'resize',
    permissions: ['android.permission.SCHEDULE_EXACT_ALARM'],
    adaptiveIcon: {
      backgroundColor: '#FFF8F1',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-notifications',
    '@react-native-community/datetimepicker',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#7B1E1E',
        image: './assets/images/drepa-splash-icon.png',
        imageWidth: 140,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: 'af1bd3cb-75b4-4e7e-8b7a-b660026dabc7',
    },
  },
};
