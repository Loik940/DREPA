import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserConsent = Database['public']['Tables']['user_consents']['Row'];

export type ProfileDataErrorKind = 'configuration' | 'network' | 'rls' | 'supabase' | 'unknown';

export class ProfileDataError extends Error {
  constructor(
    public readonly kind: ProfileDataErrorKind,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ProfileDataError';
  }
}

export const profileQueryKey = (userId: string) => ['profile', userId] as const;
export const consentQueryKey = (userId: string) => ['user-consents', userId] as const;

function classifyError(error: unknown) {
  if (error instanceof ProfileDataError) {
    return error;
  }

  const candidate = error as { code?: string; message?: string; status?: number } | null;
  const message = candidate?.message?.toLowerCase() ?? '';

  if (candidate?.status === 401 || candidate?.status === 403 || candidate?.code === '42501') {
    return new ProfileDataError('rls', 'Accès aux données du compte refusé.', error);
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
    return new ProfileDataError('network', 'La connexion réseau est indisponible.', error);
  }

  if (candidate?.code?.startsWith('PGRST')) {
    return new ProfileDataError('supabase', 'Supabase ne peut pas charger les données du compte.', error);
  }

  return new ProfileDataError('unknown', 'Les données du compte ne peuvent pas être chargées.', error);
}

function requireUserId(userId: string | undefined): asserts userId is string {
  if (!userId) {
    throw new ProfileDataError('configuration', 'La session utilisateur est indisponible.');
  }
}

async function fetchProfile(userId: string) {
  if (!supabase) {
    throw new ProfileDataError('configuration', 'La configuration Supabase est indisponible.');
  }

  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (error) {
      throw error;
    }

    return data as Profile | null;
  } catch (error) {
    throw classifyError(error);
  }
}

async function fetchConsents(userId: string) {
  if (!supabase) {
    throw new ProfileDataError('configuration', 'La configuration Supabase est indisponible.');
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
    throw classifyError(error);
  }
}

export function useProfileQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? profileQueryKey(userId) : ['profile', 'anonymous'],
    queryFn: () => {
      requireUserId(userId);
      return fetchProfile(userId);
    },
    enabled: Boolean(userId),
  });
}

export function useConsentsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? consentQueryKey(userId) : ['user-consents', 'anonymous'],
    queryFn: () => {
      requireUserId(userId);
      return fetchConsents(userId);
    },
    enabled: Boolean(userId),
  });
}

export type { Profile, UserConsent };
