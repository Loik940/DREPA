// Convertit uniquement les erreurs métier explicitement contrôlées en messages publics.
// Toute erreur inconnue reste générique afin de ne jamais exposer PostgREST, SQL ou une stack.
const safeErrorNames = new Set([
  'AccountDeletionError',
  'AuthOperationError',
  'CommunityDataError',
  'HealthLogDataError',
  'MedicationDataError',
  'ModerationDataError',
  'NotificationPermissionError',
  'ProfileDataError',
]);

export function getUserErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && safeErrorNames.has(error.name) ? error.message : fallback;
}
