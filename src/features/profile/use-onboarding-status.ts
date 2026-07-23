import { useAuth } from '@/providers/auth-provider';
import { getOnboardingStatus, hasCurrentConsent } from './completion';
import { useConsentsQuery, useProfileQuery } from './queries';

export { getOnboardingStatus } from './completion';

export function useOnboardingStatus() {
  const { user } = useAuth();
  const profileQuery = useProfileQuery(user?.id);
  const consentsQuery = useConsentsQuery(user?.id);

  return getOnboardingStatus({
    hasUser: Boolean(user),
    profile: profileQuery.data,
    hasCurrentConsent: hasCurrentConsent(consentsQuery.data),
    isLoading: profileQuery.isPending || consentsQuery.isPending,
    isError: profileQuery.isError || consentsQuery.isError,
    error: profileQuery.error ?? consentsQuery.error,
  });
}
