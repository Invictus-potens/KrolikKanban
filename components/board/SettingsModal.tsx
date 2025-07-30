
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { X, Save, Trash2, Eye, Lock, Globe, Users, Palette, Bell, Shield, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export default function SettingsModal({ isOpen, onClose, boardId }: SettingsModalProps) {
  const { theme } = useStore();
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
        ...(prev as any)[category],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', boardSettings);
    setIsDirty(false);
  };

  const handleDeleteBoard = () => {
    if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      // Delete board logic here
      console.log('Deleting board:', boardId);
      onClose();
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permissions', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex`}>
        {/* Header */}
        <div className="flex flex-col w-full">
          <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Board Settings
            </h2>
            <div className="flex items-center gap-2">
              {isDirty && (
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className={`w-64 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'} border-r ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} p-4`}>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === tab.id
                        ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`
                        : `${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-4 border-t border-slate-700">
                <button
                  onClick={handleDeleteBoard}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete Board</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Board Title
                    </label>
                    <input
                      type="text"
                      value={boardSettings.title}
                      onChange={(e) => handleSettingChange('title', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Description
                    </label>
                    <textarea
                      value={boardSettings.description}
                      onChange={(e) => handleSettingChange('description', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-900'} border-none outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Visibility
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={boardSettings.visibility === 'private'}
                          onChange={(e) => handleSettingChange('visibility', e.target.value)}
                          className="text-blue-600"
                        />
                        <Lock className="w-4 h-4" />
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Private
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Only board members can view
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="visibility"
                          value="team"
                          checked={boardSettings.visibility === 'team'}
                          onChange={(e) => handleSettingChange('visibility', e.target.value)}
                          className="text-blue-600"
                        />
                        <Users className="w-4 h-4" />
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Team
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            All team members can view
                          </div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={boardSettings.visibility === 'public'}
                          onChange={(e) => handleSettingChange('visibility', e.target.value)}
                          className="text-blue-600"
                        />
                        <Globe className="w-4 h-4" />
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Public
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Anyone with the link can view
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Board Permissions
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Allow member invites
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Members can invite new people to the board
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.permissions.allowMemberInvites}
                          onChange={(e) => handleNestedSettingChange('permissions', 'allowMemberInvites', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Allow card deletion
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Members can delete cards
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.permissions.allowCardDeletion}
                          onChange={(e) => handleNestedSettingChange('permissions', 'allowCardDeletion', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Allow list deletion
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Members can delete entire lists
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.permissions.allowListDeletion}
                          onChange={(e) => handleNestedSettingChange('permissions', 'allowListDeletion', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Require approval for changes
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Card updates need admin approval
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.permissions.requireApproval}
                          onChange={(e) => handleNestedSettingChange('permissions', 'requireApproval', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Notification Settings
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Card updates
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Get notified when cards are updated
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.notifications.cardUpdates}
                          onChange={(e) => handleNestedSettingChange('notifications', 'cardUpdates', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Mentions
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Get notified when you're mentioned
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.notifications.mentions}
                          onChange={(e) => handleNestedSettingChange('notifications', 'mentions', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Due dates
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Get notified about upcoming due dates
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.notifications.dueDate}
                          onChange={(e) => handleNestedSettingChange('notifications', 'dueDate', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            New members
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Get notified when new members join
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={boardSettings.notifications.newMembers}
                          onChange={(e) => handleNestedSettingChange('notifications', 'newMembers', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                      Board Appearance
                    </h3>
                    
                    <div className="mb-6">
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                        Background Color
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {backgroundColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleSettingChange('backgroundColor', color)}
                            className={`w-12 h-12 rounded-lg border-2 ${
                              boardSettings.backgroundColor === color
                                ? 'border-white shadow-lg'
                                : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                        Background Image
                      </label>
                      <div className={`border-2 border-dashed ${theme === 'dark' ? 'border-slate-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Drag and drop an image here, or click to select
                        </div>
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                          Choose Image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
