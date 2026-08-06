// Hook d’onboarding : combine session, profil et consentements pour piloter les redirections.
import { useAuth } from '@/providers/auth-provider';
import { getOnboardingStatus, hasCurrentConsent, ProfileDataError } from './completion';
import { useConsentsQuery, useProfileQuery } from './queries';

export { getOnboardingStatus } from './completion';

export function useOnboardingStatus() {
  const { sessionReady, user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const consentsQuery = useConsentsQuery(user?.id);

  const normalizeError = (
    error: unknown,
    source: 'profiles' | 'user_consents',
  ) => error instanceof ProfileDataError
    ? error
    : error
      ? new ProfileDataError(source, 'unknown', 'Les données du compte ne peuvent pas être chargées.')
      : null;

  const profileError = normalizeError(profileQuery.error, 'profiles');
  const consentError = normalizeError(consentsQuery.error, 'user_consents');

  const retry = async () => {
    await Promise.all([profileQuery.refetch(), consentsQuery.refetch()]);
  };

  return {
    ...getOnboardingStatus({
      sessionReady,
      hasUser: Boolean(user),
      profile: profileQuery.data,
      hasCurrentConsent: hasCurrentConsent(consentsQuery.data),
      isLoading: profileQuery.isPending || consentsQuery.isPending,
      profileError,
      consentError,
    }),
    profileError,
    consentError,
    retry,
  };
}
