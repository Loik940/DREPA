import { legalVersions } from '../../constants/legal-versions';
import { hasCurrentConsent, getOnboardingStatus } from './completion';

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
  it('recognizes the current non-revoked consent', () => {
    expect(hasCurrentConsent([consent])).toBe(true);
    expect(hasCurrentConsent([{ ...consent, revoked_at: '2026-07-23T01:00:00.000Z' }])).toBe(false);
  });

  it('requires consent before the profile', () => {
    expect(
      getOnboardingStatus({
        hasUser: true,
        profile: null,
        hasCurrentConsent: false,
        isLoading: false,
        isError: false,
        error: null,
      }).status,
    ).toBe('needs-consent');
  });

  it('requires the minimal profile after valid consent', () => {
    expect(
      getOnboardingStatus({
        hasUser: true,
        profile: { first_name: null, country: null },
        hasCurrentConsent: true,
        isLoading: false,
        isError: false,
        error: null,
      }).status,
    ).toBe('needs-profile');
  });

  it('allows the protected tabs for a complete profile', () => {
    expect(
      getOnboardingStatus({
        hasUser: true,
        profile: { first_name: 'Test', country: 'BJ' },
        hasCurrentConsent: true,
        isLoading: false,
        isError: false,
        error: null,
      }).status,
    ).toBe('complete');
  });
});
