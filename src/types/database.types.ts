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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
