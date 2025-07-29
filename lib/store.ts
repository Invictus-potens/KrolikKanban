
import { create } from 'zustand';
import { supabase } from './supabase';
import type { Database } from './supabase';

type User = Database['public']['Tables']['users']['Row'];
type Folder = Database['public']['Tables']['folders']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];
type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
type Note = Database['public']['Tables']['notes']['Row'];
type KanbanBoard = Database['public']['Tables']['kanban_boards']['Row'];
type KanbanColumn = Database['public']['Tables']['kanban_columns']['Row'];
type KanbanCard = Database['public']['Tables']['kanban_cards']['Row'];

interface AppState {
  // Auth
  user: User | null;
  isLoading: boolean;
  
  // Data
  folders: Folder[];
  tags: Tag[];
  notes: Note[];
  calendarEvents: CalendarEvent[];
  kanbanBoards: KanbanBoard[];
  kanbanColumns: Record<string, KanbanColumn[]>;
  kanbanCards: Record<string, KanbanCard[]>;
  
  // UI State
  selectedFolder: string | null;
  selectedBoard: string | null;
  isSidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Folders
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  removeFolder: (id: string) => void;
  
  // Tags
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  removeTag: (id: string) => void;
  
  // Notes
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  
  // Calendar Events
  setCalendarEvents: (events: CalendarEvent[]) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  removeCalendarEvent: (id: string) => void;
  
  // Kanban
  setKanbanBoards: (boards: KanbanBoard[]) => void;
  addKanbanBoard: (board: KanbanBoard) => void;
  updateKanbanBoard: (id: string, updates: Partial<KanbanBoard>) => void;
  removeKanbanBoard: (id: string) => void;
  
  setKanbanColumns: (boardId: string, columns: KanbanColumn[]) => void;
  addKanbanColumn: (boardId: string, column: KanbanColumn) => void;
  updateKanbanColumn: (id: string, updates: Partial<KanbanColumn>) => void;
  removeKanbanColumn: (id: string) => void;
  
  setKanbanCards: (columnId: string, cards: KanbanCard[]) => void;
  addKanbanCard: (columnId: string, card: KanbanCard) => void;
  updateKanbanCard: (id: string, updates: Partial<KanbanCard>) => void;
  removeKanbanCard: (id: string) => void;
  moveKanbanCard: (cardId: string, newColumnId: string, newOrderIndex: number) => void;
  
  // UI Actions
  setSelectedFolder: (folderId: string | null) => void;
  setSelectedBoard: (boardId: string | null) => void;
  toggleSidebar: () => void;
  
  // Auth Actions
  signOut: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  folders: [],
  tags: [],
  notes: [],
  calendarEvents: [],
  kanbanBoards: [],
  kanbanColumns: {},
  kanbanCards: {},
  selectedFolder: null,
  selectedBoard: null,
  isSidebarOpen: true,
  
  // Auth actions
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  // Folder actions
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ 
    folders: [folder, ...state.folders] 
  })),
  updateFolder: (id, updates) => set((state) => ({
    folders: state.folders.map(folder => 
      folder.id === id ? { ...folder, ...updates } : folder
    )
  })),
  removeFolder: (id) => set((state) => ({
    folders: state.folders.filter(folder => folder.id !== id)
  })),
  
  // Tag actions
  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ 
    tags: [tag, ...state.tags] 
  })),
  updateTag: (id, updates) => set((state) => ({
    tags: state.tags.map(tag => 
      tag.id === id ? { ...tag, ...updates } : tag
    )
  })),
  removeTag: (id) => set((state) => ({
    tags: state.tags.filter(tag => tag.id !== id)
  })),
  
  // Note actions
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ 
    notes: [note, ...state.notes] 
  })),
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    )
  })),
  removeNote: (id) => set((state) => ({
    notes: state.notes.filter(note => note.id !== id)
  })),
  
  // Calendar Event actions
  setCalendarEvents: (events) => set({ calendarEvents: events }),
  addCalendarEvent: (event) => set((state) => ({ 
    calendarEvents: [...state.calendarEvents, event] 
  })),
  updateCalendarEvent: (id, updates) => set((state) => ({
    calendarEvents: state.calendarEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    )
  })),
  removeCalendarEvent: (id) => set((state) => ({
    calendarEvents: state.calendarEvents.filter(event => event.id !== id)
  })),
  
  // Kanban Board actions
  setKanbanBoards: (boards) => set({ kanbanBoards: boards }),
  addKanbanBoard: (board) => set((state) => ({ 
    kanbanBoards: [board, ...state.kanbanBoards] 
  })),
  updateKanbanBoard: (id, updates) => set((state) => ({
    kanbanBoards: state.kanbanBoards.map(board => 
      board.id === id ? { ...board, ...updates } : board
    )
  })),
  removeKanbanBoard: (id) => set((state) => {
    const { [id]: removedColumns, ...remainingColumns } = state.kanbanColumns;
    const remainingCards = Object.fromEntries(
      Object.entries(state.kanbanCards).filter(([columnId, cards]) => {
        const column = Object.values(state.kanbanColumns)
          .flat()
          .find(col => col.id === columnId);
        return column?.board_id !== id;
      })
    );
    
    return {
      kanbanBoards: state.kanbanBoards.filter(board => board.id !== id),
      kanbanColumns: remainingColumns,
      kanbanCards: remainingCards
    };
  }),
  
  // Kanban Column actions
  setKanbanColumns: (boardId, columns) => set((state) => ({
    kanbanColumns: { ...state.kanbanColumns, [boardId]: columns }
  })),
  addKanbanColumn: (boardId, column) => set((state) => ({
    kanbanColumns: {
      ...state.kanbanColumns,
      [boardId]: [...(state.kanbanColumns[boardId] || []), column]
    }
  })),
  updateKanbanColumn: (id, updates) => set((state) => ({
    kanbanColumns: Object.fromEntries(
      Object.entries(state.kanbanColumns).map(([boardId, columns]) => [
        boardId,
        columns.map(column => 
          column.id === id ? { ...column, ...updates } : column
        )
      ])
    )
  })),
  removeKanbanColumn: (id) => set((state) => {
    const { [id]: removedCards, ...remainingCards } = state.kanbanCards;
    
    return {
      kanbanColumns: Object.fromEntries(
        Object.entries(state.kanbanColumns).map(([boardId, columns]) => [
          boardId,
          columns.filter(column => column.id !== id)
        ])
      ),
      kanbanCards: remainingCards
    };
  }),
  
  // Kanban Card actions
  setKanbanCards: (columnId, cards) => set((state) => ({
    kanbanCards: { ...state.kanbanCards, [columnId]: cards }
  })),
  addKanbanCard: (columnId, card) => set((state) => ({
    kanbanCards: {
      ...state.kanbanCards,
      [columnId]: [...(state.kanbanCards[columnId] || []), card]
    }
  })),
  updateKanbanCard: (id, updates) => set((state) => ({
    kanbanCards: Object.fromEntries(
      Object.entries(state.kanbanCards).map(([columnId, cards]) => [
        columnId,
        cards.map(card => 
          card.id === id ? { ...card, ...updates } : card
        )
      ])
    )
  })),
  removeKanbanCard: (id) => set((state) => ({
    kanbanCards: Object.fromEntries(
      Object.entries(state.kanbanCards).map(([columnId, cards]) => [
        columnId,
        cards.filter(card => card.id !== id)
      ])
    )
  })),
  moveKanbanCard: (cardId, newColumnId, newOrderIndex) => set((state) => {
    const card = Object.values(state.kanbanCards)
      .flat()
      .find(c => c.id === cardId);
    
    if (!card) return state;
    
    const oldColumnId = card.column_id;
    
    // Remove from old column
    const updatedCards = Object.fromEntries(
      Object.entries(state.kanbanCards).map(([columnId, cards]) => [
        columnId,
        columnId === oldColumnId 
          ? cards.filter(c => c.id !== cardId)
          : cards
      ])
    );
    
    // Add to new column
    const newCard = { ...card, column_id: newColumnId, order_index: newOrderIndex };
    updatedCards[newColumnId] = [
      ...(updatedCards[newColumnId] || []),
      newCard
    ].sort((a, b) => a.order_index - b.order_index);
    
    return { kanbanCards: updatedCards };
  }),
  
  // UI actions
  setSelectedFolder: (folderId) => set({ selectedFolder: folderId }),
  setSelectedBoard: (boardId) => set({ selectedBoard: boardId }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  // Auth actions
  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      folders: [],
      tags: [],
      notes: [],
      calendarEvents: [],
      kanbanBoards: [],
      kanbanColumns: {},
      kanbanCards: {},
      selectedFolder: null,
      selectedBoard: null
    });
  }
}));
