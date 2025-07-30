import { supabase } from './supabase';
import type { Database } from './supabase';

type BoardMember = Database['public']['Tables']['board_members']['Row'];
type BoardMemberInsert = Database['public']['Tables']['board_members']['Insert'];
type BoardMemberUpdate = Database['public']['Tables']['board_members']['Update'];
type User = Database['public']['Tables']['users']['Row'];

export interface MemberWithUser extends BoardMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface InviteMemberData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export class MemberService {
  // Buscar membros do board
  static async getBoardMembers(boardId: string): Promise<MemberWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select(`
          *,
          user:users(id, name, email, avatar_url)
        `)
        .eq('board_id', boardId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching board members:', error);
      return [];
    }
  }

  // Adicionar membro ao board
  static async addBoardMember(boardId: string, userId: string, role: 'admin' | 'member' | 'viewer'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_members')
        .insert({
          board_id: boardId,
          user_id: userId,
          role,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding board member:', error);
      return false;
    }
  }

  // Remover membro do board
  static async removeBoardMember(boardId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_members')
        .delete()
        .eq('board_id', boardId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing board member:', error);
      return false;
    }
  }

  // Atualizar role do membro
  static async updateMemberRole(boardId: string, userId: string, role: 'admin' | 'member' | 'viewer'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('board_members')
        .update({ role })
        .eq('board_id', boardId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  }

  // Buscar usuário por email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  // Verificar se usuário já é membro do board
  static async isUserBoardMember(boardId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('id')
        .eq('board_id', boardId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if user is board member:', error);
      return false;
    }
  }

  // Convidar usuário por email
  static async inviteUserByEmail(boardId: string, email: string, role: 'admin' | 'member' | 'viewer'): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se o usuário existe
      const user = await this.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Usuário não encontrado. O usuário precisa ter uma conta no sistema.'
        };
      }

      // Verificar se já é membro
      const isMember = await this.isUserBoardMember(boardId, user.id);
      if (isMember) {
        return {
          success: false,
          message: 'Usuário já é membro deste board.'
        };
      }

      // Adicionar como membro
      const success = await this.addBoardMember(boardId, user.id, role);
      if (success) {
        return {
          success: true,
          message: 'Usuário convidado com sucesso!'
        };
      } else {
        return {
          success: false,
          message: 'Erro ao adicionar usuário ao board.'
        };
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      return {
        success: false,
        message: 'Erro interno ao convidar usuário.'
      };
    }
  }

  // Buscar owner do board
  static async getBoardOwner(boardId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select(`
          owner:users!boards_owner_id_fkey(id, name, email, avatar_url)
        `)
        .eq('id', boardId)
        .single();

      if (error) throw error;
      return data?.owner || null;
    } catch (error) {
      console.error('Error fetching board owner:', error);
      return null;
    }
  }

  // Verificar permissões do usuário atual
  static async canManageMembers(boardId: string, userId: string): Promise<boolean> {
    try {
      // Verificar se é owner
      const { data: board } = await supabase
        .from('boards')
        .select('owner_id')
        .eq('id', boardId)
        .single();

      if (board?.owner_id === userId) {
        return true;
      }

      // Verificar se é admin
      const { data: member } = await supabase
        .from('board_members')
        .select('role')
        .eq('board_id', boardId)
        .eq('user_id', userId)
        .single();

      return member?.role === 'admin';
    } catch (error) {
      console.error('Error checking member permissions:', error);
      return false;
    }
  }

  // Buscar todos os usuários disponíveis para convite
  static async getAvailableUsers(boardId: string): Promise<User[]> {
    try {
      // Buscar todos os usuários que não são membros do board
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('id', 'in', `(
          SELECT user_id FROM board_members WHERE board_id = '${boardId}'
        )`)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available users:', error);
      return [];
    }
  }
} 