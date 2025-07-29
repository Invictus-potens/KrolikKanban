'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { X, Plus, Mail, Crown, User as UserIcon, Eye } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatar_url?: string;
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export default function MembersModal({ isOpen, onClose, boardId }: MembersModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'admin' },
    { id: '2', name: 'Maria Santos', email: 'maria@example.com', role: 'member' },
    { id: '3', name: 'Pedro Oliveira', email: 'pedro@example.com', role: 'viewer' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !user) return;
    
    setIsInviting(true);
    
    try {
      // Simulate API call - in real implementation, this would call your backend
      setTimeout(() => {
        const newMember: Member = {
          id: Date.now().toString(),
          name: inviteEmail.split('@')[0],
          email: inviteEmail,
          role: inviteRole,
        };
        
        setMembers([...members, newMember]);
        setInviteEmail('');
        setIsInviting(false);
      }, 1000);
    } catch (error) {
      console.error('Error inviting member:', error);
      setIsInviting(false);
    }
  };

  const handleRoleChange = (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    setMembers(members.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Membros do Board
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Invite Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Convidar Membro</h3>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member' | 'viewer')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Administrador</option>
                <option value="member">Membro</option>
                <option value="viewer">Visualizador</option>
              </select>
              <button
                onClick={handleInviteMember}
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                {isInviting ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Membros ({members.length})</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as 'admin' | 'member' | 'viewer')}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Membro</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}