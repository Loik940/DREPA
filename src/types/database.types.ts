// Types Supabase correspondant aux tables et opérations utilisées par l’application.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          full_name: string | null;
          date_of_birth: string | null;
          drepanocytosis_type: string | null;
          country: string | null;
          city: string | null;
          blood_group: string | null;
          allergies: string | null;
          care_center: string | null;
          doctor_name: string | null;
          doctor_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          whatsapp_phone: string | null;
          relationship: string | null;
          is_primary: boolean;
          consent_confirmed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['emergency_contacts']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['emergency_contacts']['Insert']>;
        Relationships: [];
      };
      user_consents: {
        Row: {
          id: string;
          user_id: string;
          terms_version: string;
          privacy_version: string;
          community_guidelines_version: string;
          accepted_at: string;
          revoked_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['user_consents']['Row'], 'id' | 'accepted_at' | 'revoked_at'> & {
          id?: string;
          accepted_at?: string;
          revoked_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_consents']['Insert']>;
        Relationships: [];
      };
      health_logs: {
        Row: {
          id: string;
          user_id: string;
          pain_level: number | null;
          pain_location: string | null;
          temperature: number | null;
          hydration_level: string | null;
          fatigue_level: number | null;
          symptoms: string[] | null;
          possible_triggers: string[] | null;
          medication_taken: boolean | null;
          notes: string | null;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['health_logs']['Row'], 'id' | 'created_at' | 'updated_at' | 'recorded_at'> & {
          id?: string;
          created_at?: string;
          recorded_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['health_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
