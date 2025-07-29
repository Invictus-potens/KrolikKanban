
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store';
import { 
  Home, 
  FolderOpen, 
  StickyNote, 
  Calendar, 
  Kanban, 
  Tag, 
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kanban', href: '/kanban', icon: Kanban },
  { name: 'Notas', href: '/notes', icon: StickyNote },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Pastas', href: '/folders', icon: FolderOpen },
  { name: 'Tags', href: '/tags', icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isSidebarOpen, folders, kanbanBoards } = useAppStore();
  const [expandedFolders, setExpandedFolders] = useState(false);
  const [expandedBoards, setExpandedBoards] = useState(false);

  if (!user) return null;

  return (
    <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      <div className="flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-semibold text-gray-900">KrolikKanban</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {isSidebarOpen && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ações Rápidas
            </h3>
            <div className="space-y-1">
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                <Plus className="h-4 w-4" />
                <span>Nova Nota</span>
              </button>
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                <Plus className="h-4 w-4" />
                <span>Novo Board</span>
              </button>
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                <Plus className="h-4 w-4" />
                <span>Novo Evento</span>
              </button>
            </div>
          </div>
        )}

        {/* Folders Section */}
        {isSidebarOpen && folders.length > 0 && (
          <div className="px-4 py-2">
            <button
              onClick={() => setExpandedFolders(!expandedFolders)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>Pastas</span>
              {expandedFolders ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedFolders && (
              <div className="mt-2 space-y-1">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/folders/${folder.id}`}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Boards Section */}
        {isSidebarOpen && kanbanBoards.length > 0 && (
          <div className="px-4 py-2">
            <button
              onClick={() => setExpandedBoards(!expandedBoards)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors"
            >
              <span>Boards</span>
              {expandedBoards ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedBoards && (
              <div className="mt-2 space-y-1">
                {kanbanBoards.map((board) => (
                  <Link
                    key={board.id}
                    href={`/kanban/${board.id}`}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Kanban className="h-4 w-4" />
                    <span>{board.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Info */}
      {isSidebarOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
