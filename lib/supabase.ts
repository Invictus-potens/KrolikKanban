
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a client that can handle missing environment variables gracefully
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          theme: 'light' | 'dark';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          avatar_url?: string;
          theme?: 'light' | 'dark';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string;
          theme?: 'light' | 'dark';
          created_at?: string;
          updated_at?: string;
        };
      };
      boards: {
        Row: {
          id: string;
          title: string;
          description?: string;
          owner_id: string;
          visibility: 'private' | 'team' | 'public';
          background_color: string;
          background_image?: string;
          allow_comments: boolean;
          allow_invites: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          owner_id: string;
          visibility?: 'private' | 'team' | 'public';
          background_color?: string;
          background_image?: string;
          allow_comments?: boolean;
          allow_invites?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          owner_id?: string;
          visibility?: 'private' | 'team' | 'public';
          background_color?: string;
          background_image?: string;
          allow_comments?: boolean;
          allow_invites?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      board_settings: {
        Row: {
          id: string;
          board_id: string;
          notifications: {
            cardUpdates: boolean;
            mentions: boolean;
            dueDate: boolean;
            newMembers: boolean;
          };
          permissions: {
            allowMemberInvites: boolean;
            allowCardDeletion: boolean;
            allowListDeletion: boolean;
            requireApproval: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          notifications?: {
            cardUpdates: boolean;
            mentions: boolean;
            dueDate: boolean;
            newMembers: boolean;
          };
          permissions?: {
            allowMemberInvites: boolean;
            allowCardDeletion: boolean;
            allowListDeletion: boolean;
            requireApproval: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          notifications?: {
            cardUpdates: boolean;
            mentions: boolean;
            dueDate: boolean;
            newMembers: boolean;
          };
          permissions?: {
            allowMemberInvites: boolean;
            allowCardDeletion: boolean;
            allowListDeletion: boolean;
            requireApproval: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          title: string;
          board_id: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          board_id: string;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          board_id?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          title: string;
          description?: string;
          list_id: string;
          position: number;
          due_date?: string;
          assigned_user_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          list_id: string;
          position: number;
          due_date?: string;
          assigned_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          list_id?: string;
          position?: number;
          due_date?: string;
          assigned_user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      labels: {
        Row: {
          id: string;
          name: string;
          color: string;
          board_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          board_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          board_id?: string;
          created_at?: string;
        };
      };
      card_labels: {
        Row: {
          id: string;
          card_id: string;
          label_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          label_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          label_id?: string;
          created_at?: string;
        };
      };
      card_comments: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      board_members: {
        Row: {
          id: string;
          board_id: string;
          user_id: string;
          role: 'admin' | 'member' | 'viewer';
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          user_id: string;
          role: 'admin' | 'member' | 'viewer';
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          user_id?: string;
          role?: 'admin' | 'member' | 'viewer';
          created_at?: string;
        };
      };
      card_checklist: {
        Row: {
          id: string;
          card_id: string;
          text: string;
          completed: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          text: string;
          completed?: boolean;
          position: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          text?: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      card_attachments: {
        Row: {
          id: string;
          card_id: string;
          name: string;
          url: string;
          type: string;
          size: number;
          uploaded_by?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          name: string;
          url: string;
          type: string;
          size: number;
          uploaded_by?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          name?: string;
          url?: string;
          type?: string;
          size?: number;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      card_watchers: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
