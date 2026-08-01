export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  screenGutter: 20,
  cardPadding: 16,
  section: 24,
  touchTarget: 44,
} as const;

export type SpacingToken = keyof typeof spacing;
