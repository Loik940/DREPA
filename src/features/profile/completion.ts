import { legalVersions } from '../../constants/legal-versions';
import type { ProfileDataError, UserConsent } from './queries';

export type OnboardingStatus =
  | 'loading'
  | 'error'
  | 'needs-consent'
  | 'needs-profile'
  | 'complete';

export function hasCurrentConsent(consents: UserConsent[] | undefined) {
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
  hasUser: boolean;
  profile: { first_name: string | null; country: string | null } | null | undefined;
  hasCurrentConsent: boolean;
  isLoading: boolean;
  isError: boolean;
  error: ProfileDataError | null;
};

export function getOnboardingStatus({
  hasUser,
  profile,
  hasCurrentConsent: currentConsent,
  isLoading,
  isError,
  error,
}: OnboardingInputs) {
  if (!hasUser || isLoading) {
    return { status: 'loading' as const, profile: null, error: null };
  }

  if (isError) {
    return { status: 'error' as const, profile: profile ?? null, error };
  }

  if (!currentConsent) {
    return { status: 'needs-consent' as const, profile: profile ?? null, error: null };
  }

  if (!profile?.first_name?.trim() || !profile.country?.trim()) {
    return { status: 'needs-profile' as const, profile: profile ?? null, error: null };
  }

  return { status: 'complete' as const, profile, error: null };
}
