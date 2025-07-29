
'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/lib/useTheme';
import { 
  Search, 
  Bell, 
  User, 
  Menu, 
  Sun, 
  Moon,
  Settings,
  LogOut
} from 'lucide-react';

export default function Header() {
  const { user, signOut } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-surface border-b border-border h-16 flex items-center justify-between px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-textPrimary">KrolikKanban</h1>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-textPrimary placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-md transition-colors"
          title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-md transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-md transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-textPrimary">
                  {user?.full_name || user?.email || 'Usuário'}
                </p>
                <p className="text-xs text-textSecondary">
                  {user?.email}
                </p>
              </div>
              
              <button className="w-full text-left px-4 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-surfaceHover flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-surfaceHover flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
