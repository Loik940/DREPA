// Dimensions communes des champs, boutons, icônes, avatars et zones tactiles.
export const sizes = {
  inputHeight: 52,
  buttonHeight: 52,
  sosSize: 56,
  touchTarget: 44,
  iconSmall: 20,
  icon: 24,
  iconLarge: 32,
  avatarSmall: 40,
  avatar: 56,
  avatarLarge: 72,
} as const;

export type SizeToken = keyof typeof sizes;
