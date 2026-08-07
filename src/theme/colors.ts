// Tokens de couleurs « Terre et Sang » du mode clair actif de DRÉPA.
export const colors = {
    brand: '#7B1E1E',
    onBrand: '#FFFFFF',
    sos: '#C0392B',
    onSos: '#FFFFFF',
    errorSoft: '#FCE9E7',
    success: '#2D6A4F',
    onSuccess: '#FFFFFF',
    successSoft: '#E7F5EC',
    warning: '#D4860A',
    onWarning: '#2B1B17',
    warningSoft: '#FFF0E1',
    actionBg: '#C87835',
    actionText: '#2B1B17',
    backgroundPrimary: '#FFF8F1',
    backgroundSurface: '#FFFFFF',
    backgroundMuted: '#FFF1ED',
    textPrimary: '#2B1B17',
    textSecondary: '#5C4A3D',
    border: '#E8D5C4',
    focus: '#D4860A',
    disabledBg: '#E8D5C4',
    disabledText: '#8A716F',
    overlay: 'rgba(43, 27, 23, 0.5)',
} as const;

export type ColorScheme = 'light';
export type ThemeColors = typeof colors;
