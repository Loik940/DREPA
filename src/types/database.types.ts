// Types Supabase correspondant aux tables et opérations utilisées par l’application.
// Json décrit les valeurs imbriquées que Supabase peut transporter sans structure métier dédiée.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Database structure le schéma public et sépare les formes de lecture, création et mise à jour.
export type Database = {
  public: {
    // Chaque table expose sa ligne complète, ses champs d’insertion et ses champs modifiables.
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
      // Cette table associe chaque compte à son rôle applicatif.
      user_roles: {
        Row: {
          user_id: string;
          role: 'user' | 'admin';
          community_alias: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'role' | 'community_alias' | 'created_at' | 'updated_at'> & {
          role?: 'user' | 'admin';
          community_alias?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>;
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
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medications']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medications']['Insert']>;
        Relationships: [];
      };
      medication_reminders: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          reminder_time: string;
          is_enabled: boolean;
          notification_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medication_reminders']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medication_reminders']['Insert']>;
        Relationships: [];
      };
      medication_intakes: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          scheduled_at: string;
          taken_at: string | null;
          status: 'pending' | 'taken' | 'skipped' | 'snoozed';
          snoozed_until: string | null;
          snooze_notification_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medication_intakes']['Row'], 'id' | 'created_at' | 'updated_at' | 'status' | 'taken_at' | 'snoozed_until' | 'snooze_notification_id'> & {
          id?: string;
          status?: 'pending' | 'taken' | 'skipped' | 'snoozed';
          taken_at?: string | null;
          snoozed_until?: string | null;
          snooze_notification_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['medication_intakes']['Insert']>;
        Relationships: [];
      };
      // Cette table décrit les publications visibles dans la communauté.
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          author_alias: string;
          category: 'testimony' | 'question' | 'motivation' | 'daily_life' | 'resources';
          content: string;
          support_count: number;
          comments_count: number;
          is_hidden: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Pick<Database['public']['Tables']['community_posts']['Row'], 'user_id' | 'category' | 'content'> &
          Partial<
            Pick<
              Database['public']['Tables']['community_posts']['Row'],
              'id' | 'author_alias' | 'support_count' | 'comments_count' | 'is_hidden' | 'deleted_at' | 'created_at' | 'updated_at'
            >
          >;
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
        Relationships: [];
      };
      // Cette table conserve les commentaires liés aux publications.
      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          author_alias: string;
          content: string;
          is_hidden: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Pick<
          Database['public']['Tables']['community_comments']['Row'],
          'post_id' | 'user_id' | 'content'
        > &
          Partial<
            Pick<
              Database['public']['Tables']['community_comments']['Row'],
              'id' | 'author_alias' | 'is_hidden' | 'deleted_at' | 'created_at' | 'updated_at'
            >
          >;
        Update: Partial<Database['public']['Tables']['community_comments']['Insert']>;
        Relationships: [];
      };
      // Cette table enregistre une réaction de soutien par publication.
      community_post_reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction_type: 'support';
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['community_post_reactions']['Row'],
          'id' | 'reaction_type' | 'created_at'
        > & {
          id?: string;
          reaction_type?: 'support';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['community_post_reactions']['Insert']>;
        Relationships: [];
      };
      // Cette table conserve les signalements envoyés pour modération.
      community_reports: {
        Row: {
          id: string;
          reporter_id: string;
          post_id: string | null;
          comment_id: string | null;
          reason:
            | 'dangerous_medical_advice'
            | 'harassment'
            | 'misleading_information'
            | 'scam_or_advertising'
            | 'personal_data'
            | 'other';
          details: string | null;
          status: 'pending' | 'reviewed' | 'dismissed';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['community_reports']['Row'],
          'id' | 'post_id' | 'comment_id' | 'details' | 'status' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          details?: string | null;
          status?: 'pending' | 'reviewed' | 'dismissed';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['community_reports']['Insert']>;
        Relationships: [];
      };
    };
    // Ces vues exposent les contenus communautaires sans identifiant de membre.
    Views: {
      community_posts_feed: {
        Row: {
          id: string;
          author_alias: string;
          category: 'testimony' | 'question' | 'motivation' | 'daily_life' | 'resources';
          content: string;
          support_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
          is_own: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      community_comments_feed: {
        Row: {
          id: string;
          post_id: string;
          author_alias: string;
          content: string;
          created_at: string;
          updated_at: string;
          is_own: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
