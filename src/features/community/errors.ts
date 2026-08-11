// Regroupe les erreurs possibles de la communauté.
// Classe les réponses techniques sans exposer leur contenu.
// Distingue la session, les droits et le réseau.
// Reconnaît les limites et les doublons contrôlés par la base.
// Fournit des messages neutres adaptés à l’affichage.
export type CommunityOperation =
  | 'list'
  | 'detail'
  | 'create'
  | 'update'
  | 'delete'
  | 'comment'
  | 'reaction'
  | 'report';

export type CommunityErrorKind =
  | 'session'
  | 'config'
  | 'network'
  | 'rls'
  | 'not_found'
  | 'rate_limit'
  | 'duplicate'
  | 'supabase'
  | 'unknown';

export class CommunityDataError extends Error {
  constructor(
    public readonly operation: CommunityOperation,
    public readonly kind: CommunityErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'CommunityDataError';
  }
}

type ErrorCandidate = {
  code?: string;
  message?: string;
  status?: number;
};

export function classifyCommunityError(error: unknown, operation: CommunityOperation): CommunityDataError {
  if (error instanceof CommunityDataError) return error;

  const candidate = error as ErrorCandidate | null;
  const message = candidate?.message?.toLowerCase() ?? '';

  if (candidate?.status === 401) {
    return new CommunityDataError(operation, 'session', 'La session doit être renouvelée.');
  }
  if (candidate?.status === 403 || candidate?.code === '42501') {
    return new CommunityDataError(operation, 'rls', 'Cette action n’est pas autorisée.');
  }
  if (candidate?.code === 'PGRST116') {
    return new CommunityDataError(operation, 'not_found', 'Ce contenu est introuvable.');
  }
  if (candidate?.code === 'P0001') {
    return new CommunityDataError(operation, 'rate_limit', 'Trop d’actions ont été envoyées. Réessayez plus tard.');
  }
  if (candidate?.code === '23505') {
    return new CommunityDataError(operation, 'duplicate', 'Cette action a déjà été enregistrée.');
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
    return new CommunityDataError(operation, 'network', 'La connexion réseau est indisponible.');
  }
  if (candidate?.code || candidate?.status) {
    return new CommunityDataError(operation, 'supabase', 'La communauté est temporairement indisponible.');
  }
  return new CommunityDataError(operation, 'unknown', 'La communauté est temporairement indisponible.');
}
