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

// User Services
export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Folder Services
export const folderService = {
  async getFolders(): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createFolder(name: string): Promise<Folder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('folders')
      .insert({ name, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateFolder(id: string, updates: Partial<Folder>): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Tag Services
export const tagService = {
  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createTag(name: string, color: string = '#3b82f6'): Promise<Tag> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tags')
      .insert({ name, color, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Calendar Event Services
export const calendarService = {
  async getEvents(startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    if (endDate) {
      query = query.lte('start_date', endDate);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({ ...event, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Note Services
export const noteService = {
  async getNotes(folder?: string): Promise<Note[]> {
    let query = supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (folder) {
      query = query.eq('folder', folder);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({ ...note, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async togglePin(id: string): Promise<Note> {
    const { data: note } = await supabase
      .from('notes')
      .select('is_pinned')
      .eq('id', id)
      .single();
    
    if (!note) throw new Error('Note not found');
    
    return this.updateNote(id, { is_pinned: !note.is_pinned });
  }
};

// Kanban Board Services
export const kanbanService = {
  async getBoards(): Promise<KanbanBoard[]> {
    const { data, error } = await supabase
      .from('kanban_boards')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createBoard(title: string): Promise<KanbanBoard> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('kanban_boards')
      .insert({ title, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBoard(id: string, updates: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const { data, error } = await supabase
      .from('kanban_boards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteBoard(id: string): Promise<void> {
    const { error } = await supabase
      .from('kanban_boards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Column Services
  async getColumns(boardId: string): Promise<KanbanColumn[]> {
    const { data, error } = await supabase
      .from('kanban_columns')
      .select('*')
      .eq('board_id', boardId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createColumn(boardId: string, title: string): Promise<KanbanColumn> {
    const columns = await this.getColumns(boardId);
    const orderIndex = columns.length;

    const { data, error } = await supabase
      .from('kanban_columns')
      .insert({ board_id: boardId, title, order_index: orderIndex })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateColumn(id: string, updates: Partial<KanbanColumn>): Promise<KanbanColumn> {
    const { data, error } = await supabase
      .from('kanban_columns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteColumn(id: string): Promise<void> {
    const { error } = await supabase
      .from('kanban_columns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Card Services
  async getCards(columnId: string): Promise<KanbanCard[]> {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('column_id', columnId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createCard(columnId: string, title: string, description?: string): Promise<KanbanCard> {
    const cards = await this.getCards(columnId);
    const orderIndex = cards.length;

    const { data, error } = await supabase
      .from('kanban_cards')
      .insert({ 
        column_id: columnId, 
        title, 
        description, 
        order_index: orderIndex,
        priority: 'medium'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCard(id: string, updates: Partial<KanbanCard>): Promise<KanbanCard> {
    const { data, error } = await supabase
      .from('kanban_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('kanban_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async moveCard(cardId: string, newColumnId: string, newOrderIndex: number): Promise<void> {
    const { error } = await supabase
      .from('kanban_cards')
      .update({ 
        column_id: newColumnId, 
        order_index: newOrderIndex 
      })
      .eq('id', cardId);
    
    if (error) throw error;
  }
};