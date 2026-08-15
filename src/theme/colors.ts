// Tokens de couleurs « Terre et Sang » du mode clair actif de DRÉPA.
export const colors = {
    // Identité principale et action d’urgence avec leurs couleurs de texte contrastées.
    brand: '#7B1E1E',
    onBrand: '#FFFFFF',
    splashBackgroundDeep: '#641515',
    splashText: '#FFF8F1',
    splashTextMuted: '#E7B5AA',
    splashAccent: '#E8A87C',
    splashPanelSoft: 'rgba(255, 248, 241, 0.16)',
    splashPanelBorder: 'rgba(255, 248, 241, 0.35)',
    sos: '#C0392B',
    onSos: '#FFFFFF',
    errorSoft: '#FCE9E7',
    // Couleurs sémantiques utilisées pour communiquer les états sans remplacer les libellés.
    success: '#2D6A4F',
    onSuccess: '#FFFFFF',
    successSoft: '#E7F5EC',
    warning: '#D4860A',
    warningText: '#714600',
    onWarning: '#2B1B17',
    warningSoft: '#FFF0E1',
    actionBg: '#C87835',
    actionText: '#2B1B17',
    // Surfaces, textes et bordures forment la base claire commune à tous les écrans.
    backgroundPrimary: '#FFF8F1',
    backgroundSurface: '#FFFFFF',
    backgroundMuted: '#FFF1ED',
    textPrimary: '#2B1B17',
    textSecondary: '#5C4A3D',
    border: '#E8D5C4',
    borderStrong: '#7A625D',
    focus: '#D4860A',
    disabledBg: '#E8D5C4',
    disabledText: '#8A716F',
    // Le voile assombrit l’arrière-plan quand une interface temporaire passe au premier plan.
    overlay: 'rgba(43, 27, 23, 0.5)',
} as const;

export type ColorScheme = 'light';
export type ThemeColors = typeof colors;
