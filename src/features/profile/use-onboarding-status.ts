import { useAuth } from '@/providers/auth-provider';
import { getOnboardingStatus, hasCurrentConsent } from './completion';
import { ProfileDataError, useConsentsQuery, useProfileQuery } from './queries';

export { getOnboardingStatus } from './completion';

export function useOnboardingStatus() {
  const { user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const consentsQuery = useConsentsQuery(user?.id);

  const error = profileQuery.error ?? consentsQuery.error;
  const normalizedError = error instanceof ProfileDataError
    ? error
    : error
      ? new ProfileDataError('unknown', 'Les données du compte ne peuvent pas être chargées.', error)
      : null;

  const retry = async () => {
    await Promise.all([profileQuery.refetch(), consentsQuery.refetch()]);
  };

  return {
    ...getOnboardingStatus({
    hasUser: Boolean(user),
    profile: profileQuery.data,
    hasCurrentConsent: hasCurrentConsent(consentsQuery.data),
    isLoading: profileQuery.isPending || consentsQuery.isPending,
    isError: Boolean(normalizedError),
    error: normalizedError,
    }),
    error: normalizedError,
    retry,
  };
}
