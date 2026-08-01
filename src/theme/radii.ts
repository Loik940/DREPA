export const radii = {
  sm: 4,
  default: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radii;
