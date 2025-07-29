
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { signOut } from '@/lib/auth';
import { Search, Moon, Sun, Bell, User, LogOut } from 'lucide-react';

export default function Header() {
  const { user, theme, setTheme, searchQuery, setSearchQuery } = useStore();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={`fixed top-0 left-64 right-0 h-16 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} border-b ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} flex items-center justify-between px-6 z-40`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search cards, boards, and members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-slate-800 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} border-none outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <button className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
          <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {user?.user_metadata?.name || user?.email}
            </span>
          </button>

          {showProfile && (
            <div className={`absolute right-0 top-full mt-2 w-48 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-lg border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} py-2`}>
              <div className={`px-4 py-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="text-sm font-medium">{user?.user_metadata?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left ${theme === 'dark' ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
