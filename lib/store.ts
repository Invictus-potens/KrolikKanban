
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  currentBoard: string | null;
  searchQuery: string;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentBoard: (boardId: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  theme: 'dark',
  currentBoard: null,
  searchQuery: '',
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  setCurrentBoard: (boardId) => set({ currentBoard: boardId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
