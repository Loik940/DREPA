import { legalVersions } from '../../constants/legal-versions';

export type ProfileQuerySource = 'profiles' | 'user_consents';
export type ProfileDataErrorKind = 'session' | 'configuration' | 'network' | 'rls' | 'supabase' | 'unknown';

export type ProfileTechnicalDetails = {
  code?: string;
  status?: number;
  message?: string;
};

export class ProfileDataError extends Error {
  constructor(
    public readonly source: ProfileQuerySource,
    public readonly kind: ProfileDataErrorKind,
    message: string,
    public readonly technical: ProfileTechnicalDetails = {},
  ) {
    super(message);
    this.name = 'ProfileDataError';
  }
}

function sanitizeTechnicalMessage(message: string | undefined) {
  if (!message) {
    return undefined;
  }

  return message
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[redacted-jwt]')
    .replace(/(access_token|refresh_token|api[_-]?key|password|authorization)(\s*[:=]\s*)[^\s&,]+/gi, '$1$2[redacted]')
    .slice(0, 500);
}

export function classifyProfileError(error: unknown, source: ProfileQuerySource) {
  if (error instanceof ProfileDataError) {
    return error;
  }

  const candidate = error as { code?: string; message?: string; status?: number } | null;
  const message = candidate?.message?.toLowerCase() ?? '';
  const technical = {
    code: candidate?.code,
    status: candidate?.status,
    message: sanitizeTechnicalMessage(candidate?.message),
  };

  if (candidate?.status === 401) {
    return new ProfileDataError(source, 'session', 'La session doit être renouvelée.', technical);
  }

  if (candidate?.status === 403 || candidate?.code === '42501') {
    return new ProfileDataError(source, 'rls', 'Accès aux données du compte refusé.', technical);
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
    return new ProfileDataError(source, 'network', 'La connexion réseau est indisponible.', technical);
  }

  if (candidate?.code?.startsWith('PGRST')) {
    return new ProfileDataError(source, 'supabase', 'Les données du compte ne peuvent pas être chargées.', technical);
  }

  return new ProfileDataError(source, 'unknown', 'Les données du compte ne peuvent pas être chargées.', technical);
}

export type OnboardingStatus =
  | 'loading'
  | 'error'
  | 'needs-consent'
  | 'needs-profile'
  | 'complete';

type ConsentVersions = {
  terms_version: string;
  privacy_version: string;
  community_guidelines_version: string;
  revoked_at: string | null;
};

export function hasCurrentConsent(consents: ConsentVersions[] | undefined) {
  return Boolean(
    consents?.some(
      (consent) =>
        consent.terms_version === legalVersions.terms &&
        consent.privacy_version === legalVersions.privacy &&
        consent.community_guidelines_version === legalVersions.communityGuidelines &&
        consent.revoked_at === null,
    ),
  );
}

type OnboardingInputs = {
  sessionReady: boolean;
  hasUser: boolean;
  profile: { first_name: string | null; country: string | null } | null | undefined;
  hasCurrentConsent: boolean;
  isLoading: boolean;
  profileError: ProfileDataError | null;
  consentError: ProfileDataError | null;
};

export function getOnboardingStatus({
  sessionReady,
  hasUser,
  profile,
  hasCurrentConsent: currentConsent,
  isLoading,
  profileError,
  consentError,
}: OnboardingInputs) {
  if (!sessionReady || isLoading) {
    return { status: 'loading' as const, profile: null, error: null };
  }

  if (!hasUser) {
    return { status: 'unauthenticated' as const, profile: null, error: null };
  }

  if (profileError || consentError) {
    return {
      status: 'error' as const,
      profile: profile ?? null,
      error: profileError ?? consentError,
      profileError,
      consentError,
    };
  }

  if (!currentConsent) {
    return { status: 'needs-consent' as const, profile: profile ?? null, error: null };
  }

  if (!profile?.first_name?.trim() || !profile.country?.trim()) {
    return { status: 'needs-profile' as const, profile: profile ?? null, error: null };
  }

  return { status: 'complete' as const, profile, error: null };
}
