import { legalVersions } from '../../constants/legal-versions';
import { invalidatePrivateQueries, queryClient, removePrivateQueries } from '../../lib/query-client';
import {
  classifyProfileError,
  getOnboardingStatus,
  hasCurrentConsent,
  ProfileDataError,
} from './completion';

const consent = {
  id: 'consent-test',
  user_id: 'user-test',
  terms_version: legalVersions.terms,
  privacy_version: legalVersions.privacy,
  community_guidelines_version: legalVersions.communityGuidelines,
  accepted_at: '2026-07-23T00:00:00.000Z',
  revoked_at: null,
};

describe('profile onboarding flow', () => {
  const baseInputs = {
    sessionReady: true,
    hasUser: true,
    profile: null,
    hasCurrentConsent: false,
    isLoading: false,
    profileError: null,
    consentError: null,
  };

  beforeEach(() => {
    queryClient.clear();
  });

  it('recognizes the current non-revoked consent', () => {
    expect(hasCurrentConsent([consent])).toBe(true);
    expect(hasCurrentConsent([{ ...consent, revoked_at: '2026-07-23T01:00:00.000Z' }])).toBe(false);
  });

  it('requires consent before the profile', () => {
    expect(
      getOnboardingStatus({
        ...baseInputs,
      }).status,
    ).toBe('needs-consent');
  });

  it('waits while the session is not ready', () => {
    expect(getOnboardingStatus({ ...baseInputs, sessionReady: false }).status).toBe('loading');
  });

  it('returns unauthenticated after session restoration without a user', () => {
    expect(getOnboardingStatus({ ...baseInputs, hasUser: false }).status).toBe('unauthenticated');
  });

  it('requires the minimal profile after valid consent', () => {
    expect(
      getOnboardingStatus({
        ...baseInputs,
        profile: { first_name: null, country: null },
        hasCurrentConsent: true,
      }).status,
    ).toBe('needs-profile');
  });

  it('allows the protected tabs for a complete profile', () => {
    expect(
      getOnboardingStatus({
        ...baseInputs,
        profile: { first_name: 'Test', country: 'BJ' },
        hasCurrentConsent: true,
      }).status,
    ).toBe('complete');
  });

  it('preserves a profiles error source', () => {
    const profileError = new ProfileDataError('profiles', 'network', 'Erreur neutre');
    const result = getOnboardingStatus({ ...baseInputs, profileError });

    expect(result.status).toBe('error');
    expect(result.error?.source).toBe('profiles');
  });

  it('preserves a user_consents error source', () => {
    const consentError = new ProfileDataError('user_consents', 'supabase', 'Erreur neutre');
    const result = getOnboardingStatus({ ...baseInputs, consentError });

    expect(result.status).toBe('error');
    expect(result.error?.source).toBe('user_consents');
  });

  it('classifies 401 as a session error and 403 as RLS', () => {
    expect(classifyProfileError({ status: 401 }, 'profiles').kind).toBe('session');
    expect(classifyProfileError({ status: 403 }, 'profiles').kind).toBe('rls');
    expect(classifyProfileError({ code: '42501' }, 'user_consents').kind).toBe('rls');
  });

  it('redacts tokens and secrets from technical messages', () => {
    const error = classifyProfileError(
      {
        status: 403,
        message: 'Bearer private-token password=hidden eyJabc.def.ghi',
      },
      'profiles',
    );

    expect(error.technical.message).not.toContain('private-token');
    expect(error.technical.message).not.toContain('hidden');
    expect(error.technical.message).not.toContain('eyJabc.def.ghi');
  });

  it('removes only the previous user cache after a user change', () => {
    queryClient.setQueryData(['profile', 'user-a'], { first_name: 'A' });
    queryClient.setQueryData(['user-consents', 'user-a'], []);
    queryClient.setQueryData(['profile', 'user-b'], { first_name: 'B' });

    removePrivateQueries('user-a');

    expect(queryClient.getQueryData(['profile', 'user-a'])).toBeUndefined();
    expect(queryClient.getQueryData(['user-consents', 'user-a'])).toBeUndefined();
    expect(queryClient.getQueryData(['profile', 'user-b'])).toEqual({ first_name: 'B' });
  });

  it('purges all private cache entries after sign out', () => {
    queryClient.setQueryData(['profile', 'user-a'], { first_name: 'A' });
    queryClient.setQueryData(['user-consents', 'user-a'], []);
    queryClient.setQueryData(['public-resource'], { value: true });

    removePrivateQueries();

    expect(queryClient.getQueryData(['profile', 'user-a'])).toBeUndefined();
    expect(queryClient.getQueryData(['user-consents', 'user-a'])).toBeUndefined();
    expect(queryClient.getQueryData(['public-resource'])).toEqual({ value: true });
  });

  it('invalidates private queries after sign in', async () => {
    queryClient.setQueryData(['profile', 'user-a'], { first_name: 'A' });
    queryClient.setQueryData(['user-consents', 'user-a'], []);

    await invalidatePrivateQueries('user-a');

    expect(queryClient.getQueryState(['profile', 'user-a'])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(['user-consents', 'user-a'])?.isInvalidated).toBe(true);
  });
});
