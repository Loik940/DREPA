// Mutations Profil : enregistre le profil et les consentements via Supabase et invalide leur cache.
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { legalVersions } from '@/constants/legal-versions';
import { supabase } from '@/lib/supabase';
import { consentQueryKey, profileQueryKey } from './queries';
import type { ConsentValues, ProfileValues } from './schemas';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase configuration is unavailable.');
  }

  return supabase;
}

export function useUpsertProfileMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ProfileValues) => {
      const profile = {
        id: userId,
        first_name: values.first_name,
        country: values.country,
        full_name: values.full_name ?? null,
        date_of_birth: values.date_of_birth ?? null,
        drepanocytosis_type: values.drepanocytosis_type ?? null,
        city: values.city ?? null,
        blood_group: values.blood_group ?? null,
        allergies: values.allergies ?? null,
        care_center: values.care_center ?? null,
        doctor_name: values.doctor_name ?? null,
        doctor_phone: values.doctor_phone ?? null,
      };
      const { data, error } = await requireSupabase()
        .from('profiles')
        .upsert(profile, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey(userId) });
    },
  });
}

export function useAcceptConsentMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_values: ConsentValues) => {
      const { data, error } = await requireSupabase()
        .from('user_consents')
        .insert({
          user_id: userId,
          terms_version: legalVersions.terms,
          privacy_version: legalVersions.privacy,
          community_guidelines_version: legalVersions.communityGuidelines,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: consentQueryKey(userId) });
    },
  });
}
