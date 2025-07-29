
'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { kanbanService } from '@/lib/services';
import { X, Save, Trash2, Eye, Lock, Globe, Users, Palette, Bell, Shield, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export default function SettingsModal({ isOpen, onClose, boardId }: SettingsModalProps) {
  const { updateKanbanBoard, removeKanbanBoard } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [boardSettings, setBoardSettings] = useState({
    title: 'Main Project',
    description: 'Main project management board for team collaboration',
    visibility: 'private',
    allowComments: true,
    allowInvites: true,
    backgroundColor: '#3B82F6',
    backgroundImage: null,
    notifications: {
      cardUpdates: true,
      mentions: true,
      dueDate: true,
      newMembers: true,
    },
    permissions: {
      allowMemberInvites: true,
      allowCardDeletion: false,
      allowListDeletion: false,
      requireApproval: false,
    }
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const handleSettingChange = (key: string, value: any) => {
    setBoardSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const handleNestedSettingChange = (category: string, key: string, value: any) => {
    setBoardSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const updatedBoard = await kanbanService.updateBoard(boardId, {
        title: boardSettings.title,
        description: boardSettings.description
      });
      
      updateKanbanBoard(boardId, updatedBoard);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (confirm('Tem certeza que deseja excluir este board? Esta ação não pode ser desfeita.')) {
      try {
        await kanbanService.deleteBoard(boardId);
        removeKanbanBoard(boardId);
        onClose();
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: <Settings className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissões', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Aparência', icon: <Palette className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex">
        {/* Header */}
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Configurações do Board
            </h2>
            <div className="flex items-center gap-2">
              {isDirty && (
                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Salvando...' : 'Salvar'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Board
                  </label>
                  <input
                    type="text"
                    value={boardSettings.title}
                    onChange={(e) => handleSettingChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={boardSettings.description}
                    onChange={(e) => handleSettingChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibilidade
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={boardSettings.visibility === 'private'}
                        onChange={(e) => handleSettingChange('visibility', e.target.value)}
                        className="mr-2"
                      />
                      <Lock className="w-4 h-4 mr-2 text-gray-500" />
                      Privado
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={boardSettings.visibility === 'public'}
                        onChange={(e) => handleSettingChange('visibility', e.target.value)}
                        className="mr-2"
                      />
                      <Globe className="w-4 h-4 mr-2 text-gray-500" />
                      Público
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Permissões de Membros</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={boardSettings.permissions.allowMemberInvites}
                        onChange={(e) => handleNestedSettingChange('permissions', 'allowMemberInvites', e.target.checked)}
                        className="mr-2"
                      />
                      Permitir que membros convidem outros usuários
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={boardSettings.permissions.allowCardDeletion}
                        onChange={(e) => handleNestedSettingChange('permissions', 'allowCardDeletion', e.target.checked)}
                        className="mr-2"
                      />
                      Permitir exclusão de cards
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={boardSettings.permissions.allowListDeletion}
                        onChange={(e) => handleNestedSettingChange('permissions', 'allowListDeletion', e.target.checked)}
                        className="mr-2"
                      />
                      Permitir exclusão de colunas
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notificações</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={boardSettings.notifications.cardUpdates}
                        onChange={(e) => handleNestedSettingChange('notifications', 'cardUpdates', e.target.checked)}
                        className="mr-2"
                      />
                      Atualizações de cards
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={boardSettings.notifications.mentions}
                        onChange={(e) => handleNestedSettingChange('notifications', 'mentions', e.target.checked)}
                        className="mr-2"
                      />
                      Menções
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={boardSettings.notifications.dueDate}
                        onChange={(e) => handleNestedSettingChange('notifications', 'dueDate', e.target.checked)}
                        className="mr-2"
                      />
                      Datas de vencimento
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cores de Fundo</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {backgroundColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleSettingChange('backgroundColor', color)}
                        className={`w-12 h-12 rounded-lg border-2 ${
                          boardSettings.backgroundColor === color
                            ? 'border-gray-900'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleDeleteBoard}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Board
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              {isDirty && (
                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
