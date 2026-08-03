module.exports = {
  name: 'DREPA',
  slug: 'drepa',
  version: '0.1.0',
  platforms: ['android'],
  orientation: 'portrait',
  scheme: 'drepa',
  userInterfaceStyle: 'light',
  icon: './assets/images/icon.png',
  android: {
    package: 'bj.drepa.app',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-notifications',
    'expo-location',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
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
