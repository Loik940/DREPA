// Regroupe les erreurs des opérations de modération.
// Classe les réponses techniques sans afficher leur contenu.
// Distingue la session, la configuration et les autorisations.
// Reconnaît les absences et les décisions concurrentes.
// Fournit des messages neutres utilisables par l'interface.
export type ModerationOperation = 'role' | 'list' | 'detail' | 'history' | 'decide';

export type ModerationErrorKind =
  | 'session'
  | 'config'
  | 'network'
  | 'rls'
  | 'not_found'
  | 'conflict'
  | 'supabase';

export class ModerationDataError extends Error {
  constructor(
    public readonly operation: ModerationOperation,
    public readonly kind: ModerationErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'ModerationDataError';
  }
}

type ErrorCandidate = {
  code?: string;
  message?: string;
  name?: string;
  status?: number;
};

export function classifyModerationError(
  error: unknown,
  operation: ModerationOperation,
): ModerationDataError {
  if (error instanceof ModerationDataError) return error;

  const candidate = error as ErrorCandidate | null;
  const message = candidate?.message?.toLowerCase() ?? '';

  if (candidate?.status === 401) {
    return new ModerationDataError(operation, 'session', 'La session doit être renouvelée.');
  }
  if (candidate?.status === 403 || candidate?.code === '42501') {
    return new ModerationDataError(operation, 'rls', "Cette action d'administration n'est pas autorisée.");
  }
  if (candidate?.code === 'PGRST116' || candidate?.code === 'P0002') {
    return new ModerationDataError(operation, 'not_found', 'Ce signalement est introuvable.');
  }
  if (candidate?.code === '55000') {
    return new ModerationDataError(operation, 'conflict', 'Ce signalement a déjà été traité.');
  }
  if (
    candidate?.name === 'TypeError' ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline')
  ) {
    return new ModerationDataError(operation, 'network', 'La connexion réseau est indisponible.');
  }
  return new ModerationDataError(operation, 'supabase', 'La modération est temporairement indisponible.');
}
