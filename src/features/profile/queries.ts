import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Database } from '@/types/database.types';
import {
  classifyProfileError,
  ProfileDataError,
  type ProfileQuerySource,
} from './completion';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserConsent = Database['public']['Tables']['user_consents']['Row'];

export { ProfileDataError } from './completion';
export type { ProfileDataErrorKind, ProfileQuerySource } from './completion';

export const profileQueryKey = (userId: string) => ['profile', userId] as const;
export const consentQueryKey = (userId: string) => ['user-consents', userId] as const;

function requireUserId(userId: string | undefined, source: ProfileQuerySource): asserts userId is string {
  if (!userId) {
    throw new ProfileDataError(source, 'session', 'La session utilisateur est indisponible.');
  }
}

async function fetchProfile(userId: string) {
  if (!supabase) {
    throw new ProfileDataError('profiles', 'configuration', 'La configuration Supabase est indisponible.');
  }

  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (error) {
      throw error;
    }

    return data as Profile | null;
  } catch (error) {
    throw classifyProfileError(error, 'profiles');
  }
}

async function fetchConsents(userId: string) {
  if (!supabase) {
    throw new ProfileDataError('user_consents', 'configuration', 'La configuration Supabase est indisponible.');
  }

  try {
    const { data, error } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as UserConsent[];
  } catch (error) {
    throw classifyProfileError(error, 'user_consents');
  }
}

export function useProfileQuery(userId: string | undefined) {
  const { sessionReady, status, user } = useAuth();
  const queryEnabled = sessionReady && status === 'authenticated' && user?.id === userId;

  return useQuery({
    queryKey: userId ? profileQueryKey(userId) : ['profile', 'anonymous'],
    queryFn: () => {
      requireUserId(userId, 'profiles');
      return fetchProfile(userId);
    },
    enabled: queryEnabled,
  });
}

export function useConsentsQuery(userId: string | undefined) {
  const { sessionReady, status, user } = useAuth();
  const queryEnabled = sessionReady && status === 'authenticated' && user?.id === userId;

  return useQuery({
    queryKey: userId ? consentQueryKey(userId) : ['user-consents', 'anonymous'],
    queryFn: () => {
      requireUserId(userId, 'user_consents');
      return fetchConsents(userId);
    },
    enabled: queryEnabled,
  });
}

export type { Profile, UserConsent };
