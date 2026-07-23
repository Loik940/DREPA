import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserConsent = Database['public']['Tables']['user_consents']['Row'];

export const profileQueryKey = (userId: string) => ['profile', userId] as const;
export const consentQueryKey = (userId: string) => ['user-consents', userId] as const;

async function fetchProfile(userId: string) {
  if (!supabase) {
    throw new Error('Supabase configuration is unavailable.');
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data as Profile | null;
}

async function fetchConsents(userId: string) {
  if (!supabase) {
    throw new Error('Supabase configuration is unavailable.');
  }

  const { data, error } = await supabase
    .from('user_consents')
    .select('*')
    .eq('user_id', userId)
    .order('accepted_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as UserConsent[];
}

export function useProfileQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? profileQueryKey(userId) : ['profile', 'anonymous'],
    queryFn: () => fetchProfile(userId as string),
    enabled: Boolean(userId),
  });
}

export function useConsentsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? consentQueryKey(userId) : ['user-consents', 'anonymous'],
    queryFn: () => fetchConsents(userId as string),
    enabled: Boolean(userId),
  });
}

export type { Profile, UserConsent };
