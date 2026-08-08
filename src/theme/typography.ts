// Familles, poids et styles typographiques utilisés par les composants DRÉPA.
export const fontFamilies = {
  body: 'Inter',
  display: 'Inter',
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

// Les variantes donnent une hiérarchie lisible avec des tailles et interlignes adaptés aux écrans mobiles.
export const typography = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
    letterSpacing: -0.4,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    fontWeight: fontWeights.bold,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    fontWeight: fontWeights.bold,
    lineHeight: 28,
  },
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: 18,
    fontWeight: fontWeights.regular,
    lineHeight: 26,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  label: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: fontWeights.semiBold,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
  },
  button: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: fontWeights.semiBold,
    lineHeight: 22,
  },
} as const;
