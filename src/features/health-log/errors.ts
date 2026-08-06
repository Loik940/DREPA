// Erreurs structurées du Journal : session, réseau, RLS, absence, Supabase et configuration.
export type HealthLogOperation = 'list' | 'detail' | 'statistics' | 'create' | 'update' | 'delete';
export type HealthLogErrorKind = 'session' | 'configuration' | 'network' | 'rls' | 'not_found' | 'supabase' | 'unknown';

type TechnicalDetails = {
  code?: string;
  status?: number;
  message?: string;
};

export class HealthLogDataError extends Error {
  constructor(
    public readonly operation: HealthLogOperation,
    public readonly kind: HealthLogErrorKind,
    message: string,
    public readonly technical: TechnicalDetails = {},
  ) {
    super(message);
    this.name = 'HealthLogDataError';
  }
}

function sanitizeMessage(message: string | undefined) {
  if (!message) return undefined;

  return message
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]')
    .replace(/(access_token|refresh_token|api[_-]?key|password|authorization)(\s*[:=]\s*)[^\s&,]+/gi, '$1$2[redacted]')
    .slice(0, 500);
}

export function classifyHealthLogError(error: unknown, operation: HealthLogOperation) {
  if (error instanceof HealthLogDataError) return error;

  const candidate = error as { code?: string; message?: string; status?: number } | null;
  const normalizedMessage = candidate?.message?.toLowerCase() ?? '';
  const technical = {
    code: candidate?.code,
    status: candidate?.status,
    message: sanitizeMessage(candidate?.message),
  };

  if (candidate?.status === 401) {
    return new HealthLogDataError(operation, 'session', 'Ta session doit être renouvelée.', technical);
  }

  if (candidate?.status === 403 || candidate?.code === '42501') {
    return new HealthLogDataError(operation, 'rls', 'L’accès au journal est refusé.', technical);
  }

  if (candidate?.code === 'PGRST116') {
    return new HealthLogDataError(operation, 'not_found', 'Cette entrée du journal est introuvable.', technical);
  }

  if (normalizedMessage.includes('network') || normalizedMessage.includes('fetch') || normalizedMessage.includes('offline')) {
    return new HealthLogDataError(operation, 'network', 'La connexion réseau est indisponible.', technical);
  }

  if (candidate?.code?.startsWith('PGRST')) {
    return new HealthLogDataError(operation, 'supabase', 'Le journal est temporairement indisponible.', technical);
  }

  return new HealthLogDataError(operation, 'unknown', 'Le journal est temporairement indisponible.', technical);
}
