import { supabase } from './supabase';
import type { Database } from './supabase';

type Board = Database['public']['Tables']['boards']['Row'];
type BoardSettings = Database['public']['Tables']['board_settings']['Row'];
type BoardInsert = Database['public']['Tables']['boards']['Insert'];
type BoardSettingsInsert = Database['public']['Tables']['board_settings']['Insert'];

export interface BoardSettingsForm {
  title: string;
  description?: string;
  visibility: 'private' | 'team' | 'public';
  background_color: string;
  background_image?: string;
  allow_comments: boolean;
  allow_invites: boolean;
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
}

export class BoardService {
  // Buscar configurações do board
  static async getBoardSettings(boardId: string): Promise<BoardSettingsForm | null> {
    try {
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (boardError) throw boardError;

      const { data: settings, error: settingsError } = await supabase
        .from('board_settings')
        .select('*')
        .eq('board_id', boardId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      return {
        title: board.title,
        description: board.description || '',
        visibility: board.visibility,
        background_color: board.background_color,
        background_image: board.background_image,
        allow_comments: board.allow_comments,
        allow_invites: board.allow_invites,
        notifications: settings?.notifications || {
          cardUpdates: true,
          mentions: true,
          dueDate: true,
          newMembers: true,
        },
        permissions: settings?.permissions || {
          allowMemberInvites: true,
          allowCardDeletion: false,
          allowListDeletion: false,
          requireApproval: false,
        },
      };
    } catch (error) {
      console.error('Error fetching board settings:', error);
      return null;
    }
  }

  // Salvar configurações do board
  static async saveBoardSettings(boardId: string, settings: BoardSettingsForm): Promise<boolean> {
    try {
      // Atualizar board
      const { error: boardError } = await supabase
        .from('boards')
        .update({
          title: settings.title,
          description: settings.description,
          visibility: settings.visibility,
          background_color: settings.background_color,
          background_image: settings.background_image,
          allow_comments: settings.allow_comments,
          allow_invites: settings.allow_invites,
        })
        .eq('id', boardId);

      if (boardError) throw boardError;

      // Upsert board settings
      const { error: settingsError } = await supabase
        .from('board_settings')
        .upsert({
          board_id: boardId,
          notifications: settings.notifications,
          permissions: settings.permissions,
        });

      if (settingsError) throw settingsError;

      return true;
    } catch (error) {
      console.error('Error saving board settings:', error);
      return false;
    }
  }

  // Deletar board
  static async deleteBoard(boardId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting board:', error);
      return false;
    }
  }

  // Buscar board por ID
  static async getBoard(boardId: string): Promise<Board | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching board:', error);
      return null;
    }
  }

  // Criar novo board
  static async createBoard(boardData: BoardInsert): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert(boardData)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating board:', error);
      return null;
    }
  }

  // Buscar boards do usuário
  static async getUserBoards(userId: string): Promise<Board[]> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .or(`owner_id.eq.${userId},visibility.eq.public`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user boards:', error);
      return [];
    }
  }

  // Verificar permissões do usuário no board
  static async getUserBoardRole(boardId: string, userId: string): Promise<'owner' | 'admin' | 'member' | 'viewer' | null> {
    try {
      // Verificar se é o dono
      const { data: board } = await supabase
        .from('boards')
        .select('owner_id')
        .eq('id', boardId)
        .single();

      if (board?.owner_id === userId) {
        return 'owner';
      }

      // Verificar role como membro
      const { data: member } = await supabase
        .from('board_members')
        .select('role')
        .eq('board_id', boardId)
        .eq('user_id', userId)
        .single();

      return member?.role as 'admin' | 'member' | 'viewer' || null;
    } catch (error) {
      console.error('Error checking user board role:', error);
      return null;
    }
  }
} 