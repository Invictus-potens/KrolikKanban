
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store';
import { 
  Folder, 
  Kanban, 
  Calendar, 
  FileText, 
  Tag, 
  Settings,
  ChevronDown,
  Plus
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const { isSidebarOpen, selectedBoard, setSelectedBoard } = useAppStore();
  const [expandedFolders, setExpandedFolders] = useState(true);
  const [expandedBoards, setExpandedBoards] = useState(true);

  if (!user) return null;

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: <Kanban className="w-5 h-5" />,
      href: '/',
      count: null
    },
    {
      title: 'Kanban',
      icon: <Kanban className="w-5 h-5" />,
      href: '/kanban',
      count: 3
    },
    {
      title: 'Calendário',
      icon: <Calendar className="w-5 h-5" />,
      href: '/calendar',
      count: 5
    },
    {
      title: 'Notas',
      icon: <FileText className="w-5 h-5" />,
      href: '/notes',
      count: 12
    },
    {
      title: 'Tags',
      icon: <Tag className="w-5 h-5" />,
      href: '/tags',
      count: 8
    },
    {
      title: 'Configurações',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
      count: null
    }
  ];

  const folders = [
    { id: '1', name: 'Todas as Notas', count: 2 },
    { id: '2', name: 'teste', count: 0 }
  ];

  const boards = [
    { id: '1', name: 'Projeto Principal', count: 5 },
    { id: '2', name: 'Backlog', count: 3 },
    { id: '3', name: 'Em Progresso', count: 2 }
  ];

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-textPrimary">KrolikKanban</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center justify-between px-3 py-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-md transition-colors group"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            {item.count && (
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Folders Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-textPrimary">Pastas</h3>
          <button className="text-accent hover:text-accentHover text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center justify-between px-3 py-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-md transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4" />
                <span className="text-sm">{folder.name}</span>
              </div>
              {folder.count > 0 && (
                <span className="text-xs bg-surfaceHover text-textSecondary px-2 py-1 rounded-full">
                  {folder.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Boards Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-textPrimary">Boards Kanban</h3>
          <button className="text-accent hover:text-accentHover text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer ${
                selectedBoard === board.id
                  ? 'bg-selected text-textPrimary'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceHover'
              }`}
              onClick={() => setSelectedBoard(board.id)}
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4" />
                <span className="text-sm">{board.name}</span>
              </div>
              {board.count > 0 && (
                <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                  {board.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
