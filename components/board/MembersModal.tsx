'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { MemberService, MemberWithUser } from '@/lib/memberService';
import { X, Plus, Mail, Crown, User as UserIcon, Eye, AlertCircle } from 'lucide-react';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export default function MembersModal({ isOpen, onClose, boardId }: MembersModalProps) {
  const { theme, user } = useStore();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [owner, setOwner] = useState<{ id: string; name: string; email: string; avatar_url?: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Carregar membros do board
  useEffect(() => {
    if (isOpen && boardId && user) {
      loadBoardMembers();
      loadBoardOwner();
      checkPermissions();
    }
  }, [isOpen, boardId, user]);

  const loadBoardMembers = async () => {
    setIsLoading(true);
    try {
      const membersData = await MemberService.getBoardMembers(boardId);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading board members:', error);
      setErrorMessage('Erro ao carregar membros do board.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBoardOwner = async () => {
    try {
      const ownerData = await MemberService.getBoardOwner(boardId);
      setOwner(ownerData);
    } catch (error) {
      console.error('Error loading board owner:', error);
    }
  };

  const checkPermissions = async () => {
    if (!user) return;
    try {
      const canManage = await MemberService.canManageMembers(boardId, user.id);
      setCanManageMembers(canManage);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !user) return;
    
    setIsInviting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const result = await MemberService.inviteUserByEmail(boardId, inviteEmail, inviteRole);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setInviteEmail('');
        // Recarregar membros
        await loadBoardMembers();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
      setErrorMessage('Erro interno ao convidar usuário.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (!user) return;
    
    try {
      const success = await MemberService.updateMemberRole(boardId, memberId, newRole);
      if (success) {
        // Recarregar membros
        await loadBoardMembers();
        setSuccessMessage('Role atualizada com sucesso!');
      } else {
        setErrorMessage('Erro ao atualizar role do membro.');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      setErrorMessage('Erro interno ao atualizar role.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user || !canManageMembers) return;
    
    if (confirm('Tem certeza que deseja remover este membro do board?')) {
      try {
        const success = await MemberService.removeBoardMember(boardId, memberId);
        if (success) {
          // Recarregar membros
          await loadBoardMembers();
          setSuccessMessage('Membro removido com sucesso!');
        } else {
          setErrorMessage('Erro ao remover membro do board.');
        }
      } catch (error) {
        console.error('Error removing member:', error);
        setErrorMessage('Erro interno ao remover membro.');
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'member': return <UserIcon className="w-4 h-4 text-blue-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-500';
      case 'member': return 'text-blue-500';
      case 'viewer': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Membros do Board
          </h2>
                      <button
              onClick={onClose}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              title="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-red-700 hover:text-red-900"
                title="Fechar mensagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-green-700 hover:text-green-900"
                title="Fechar mensagem"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Invite Section */}
          {canManageMembers && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                Convidar Novo Membro
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="invite-email" className="sr-only">
                    Email do usuário
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="Digite o email do usuário"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex gap-2">
                  <label htmlFor="invite-role" className="sr-only">
                    Role do usuário
                  </label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                    className={`px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 pr-8`}
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <button
                    onClick={handleInviteMember}
                    disabled={isInviting || !inviteEmail.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title="Convidar usuário"
                  >
                    {isInviting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Convidar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members List */}
          <div>
            <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              Membros do Board ({members.length + (owner ? 1 : 0)})
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Owner */}
                {owner && (
                  <div className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} border-l-4 border-yellow-500`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {owner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {owner.name}
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {owner.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Owner</span>
                    </div>
                  </div>
                )}

                {/* Members */}
                {members.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {member.user.name}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${getRoleColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                      <span className="text-sm capitalize">{member.role}</span>
                    </div>
                    {canManageMembers && member.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-slate-600' : 'hover:bg-gray-200'} text-red-500`}
                        title="Remover membro"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>• <strong>Owner</strong> - Pode fazer tudo, incluindo deletar o board</p>
            <p>• <strong>Admin</strong> - Pode gerenciar membros e configurações</p>
            <p>• <strong>Member</strong> - Pode criar e editar cards</p>
            <p>• <strong>Viewer</strong> - Apenas visualização do board</p>
            {!canManageMembers && (
              <p className="mt-2 text-orange-500">
                ⚠️ Você não tem permissão para gerenciar membros
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}