// Erreurs structurées du module Médicaments, nettoyées avant affichage à l’utilisateur.
export type MedicationOperation = 'list' | 'detail' | 'create' | 'update' | 'delete' | 'intake';
export type MedicationErrorKind = 'session' | 'configuration' | 'network' | 'rls' | 'not_found' | 'supabase' | 'unknown';

export class MedicationDataError extends Error {
  constructor(public readonly operation: MedicationOperation, public readonly kind: MedicationErrorKind, message: string) {
    super(message);
    this.name = 'MedicationDataError';
  }
}

export function classifyMedicationError(error: unknown, operation: MedicationOperation) {
  if (error instanceof MedicationDataError) return error;
  const candidate = error as { code?: string; message?: string; status?: number } | null;
  const message = candidate?.message?.toLowerCase() ?? '';

  if (candidate?.status === 401) return new MedicationDataError(operation, 'session', 'Ta session doit être renouvelée.');
  if (candidate?.status === 403 || candidate?.code === '42501') return new MedicationDataError(operation, 'rls', 'L’accès aux traitements est refusé.');
  if (candidate?.code === 'PGRST116') return new MedicationDataError(operation, 'not_found', 'Ce traitement est introuvable.');
  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) return new MedicationDataError(operation, 'network', 'La connexion réseau est indisponible.');
  return new MedicationDataError(operation, 'supabase', 'Les traitements sont temporairement indisponibles.');
}
