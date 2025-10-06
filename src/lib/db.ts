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
      profiles: {
        Row: {
          id: string;
          created_at: string;
          display_name: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          display_name?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          display_name?: string | null;
        };
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body_md: string;
          tags: string[];
          folder: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body_md: string;
          tags?: string[];
          folder?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body_md?: string;
          tags?: string[];
          folder?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompt_versions: {
        Row: {
          id: string;
          prompt_id: string;
          body_md: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          body_md: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          body_md?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
