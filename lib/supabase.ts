
import { createClient } from '@supabase/supabase-js';

// Configuração temporária - substitua pelas suas credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exemplo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sua-chave-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string | null;
          all_day: boolean;
          color: string;
          reminder_minutes: number | null;
          reminder_set: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date?: string | null;
          all_day?: boolean;
          color?: string;
          reminder_minutes?: number | null;
          reminder_set?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string | null;
          all_day?: boolean;
          color?: string;
          reminder_minutes?: number | null;
          reminder_set?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          folder: string | null;
          tags: string[] | null;
          is_pinned: boolean;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          folder?: string | null;
          tags?: string[] | null;
          is_pinned?: boolean;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          folder?: string | null;
          tags?: string[] | null;
          is_pinned?: boolean;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      kanban_boards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      kanban_columns: {
        Row: {
          id: string;
          board_id: string;
          title: string;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          title: string;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          title?: string;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      kanban_cards: {
        Row: {
          id: string;
          column_id: string;
          title: string;
          description: string | null;
          assignee: string | null;
          priority: 'low' | 'medium' | 'high';
          due_date: string | null;
          tags: string[] | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          column_id: string;
          title: string;
          description?: string | null;
          assignee?: string | null;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          tags?: string[] | null;
          order_index: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          column_id?: string;
          title?: string;
          description?: string | null;
          assignee?: string | null;
          priority?: 'low' | 'medium' | 'high';
          due_date?: string | null;
          tags?: string[] | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
