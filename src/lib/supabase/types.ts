export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      invitations: {
        Row: {
          id: string;
          email: string;
          code: string;
          used: boolean;
          used_at: string | null;
          created_at: string;
          expires_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          code: string;
          used?: boolean;
          used_at?: string | null;
          created_at?: string;
          expires_at: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          email?: string;
          code?: string;
          used?: boolean;
          used_at?: string | null;
          created_at?: string;
          expires_at?: string;
          created_by?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          invite_quota: number;
          invites_sent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          invite_quota?: number;
          invites_sent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          invite_quota?: number;
          invites_sent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
