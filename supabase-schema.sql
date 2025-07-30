-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'pt-BR',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create boards table
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
  background_color TEXT DEFAULT '#3B82F6',
  background_image TEXT,
  background_type TEXT DEFAULT 'color' CHECK (background_type IN ('color', 'image', 'gradient')),
  allow_comments BOOLEAN DEFAULT true,
  allow_invites BOOLEAN DEFAULT true,
  allow_attachments BOOLEAN DEFAULT true,
  allow_checklists BOOLEAN DEFAULT true,
  allow_watchers BOOLEAN DEFAULT true,
  allow_labels BOOLEAN DEFAULT true,
  allow_assignments BOOLEAN DEFAULT true,
  allow_due_dates BOOLEAN DEFAULT true,
  allow_priorities BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  template_source_id UUID REFERENCES public.boards(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_settings table for advanced settings
CREATE TABLE IF NOT EXISTS public.board_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  notifications JSONB DEFAULT '{
    "cardUpdates": true,
    "mentions": true,
    "dueDate": true,
    "newMembers": true,
    "comments": true,
    "assignments": true,
    "attachments": false
  }',
  permissions JSONB DEFAULT '{
    "allowMemberInvites": true,
    "allowCardDeletion": false,
    "allowListDeletion": false,
    "requireApproval": false,
    "allowPublicView": false,
    "allowGuestComments": false
  }',
  display_settings JSONB DEFAULT '{
    "showCardNumbers": true,
    "showDueDates": true,
    "showAssignees": true,
    "showLabels": true,
    "showChecklists": true,
    "compactMode": false
  }',
  automation JSONB DEFAULT '{
    "autoArchiveCompleted": false,
    "autoAssignToCreator": false,
    "autoSetDueDate": false,
    "autoNotifyWatchers": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id)
);

-- Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6B7280',
  is_archived BOOLEAN DEFAULT false,
  wip_limit INTEGER DEFAULT NULL CHECK (wip_limit > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  due_date_reminder TIMESTAMP WITH TIME ZONE,
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_hours DECIMAL(5,2) DEFAULT NULL CHECK (estimated_hours > 0),
  actual_hours DECIMAL(5,2) DEFAULT NULL CHECK (actual_hours > 0),
  story_points INTEGER DEFAULT NULL CHECK (story_points > 0),
  is_archived BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  template_source_id UUID REFERENCES public.cards(id),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  text_color TEXT DEFAULT '#FFFFFF',
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_labels junction table
CREATE TABLE IF NOT EXISTS public.card_labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
  applied_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, label_id)
);

-- Create card_comments table
CREATE TABLE IF NOT EXISTS public.card_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]',
  parent_id UUID REFERENCES public.card_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_members table
CREATE TABLE IF NOT EXISTS public.board_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{
    "can_edit_board": true,
    "can_delete_board": false,
    "can_manage_members": false,
    "can_create_cards": true,
    "can_edit_cards": true,
    "can_delete_cards": false,
    "can_assign_cards": true,
    "can_move_cards": true,
    "can_comment": true,
    "can_upload_attachments": true
  }',
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- Create card_checklist table
CREATE TABLE IF NOT EXISTS public.card_checklist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_attachments table
CREATE TABLE IF NOT EXISTS public.card_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL CHECK (size > 0),
  mime_type TEXT,
  thumbnail_url TEXT,
  is_image BOOLEAN DEFAULT false,
  image_width INTEGER,
  image_height INTEGER,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_watchers table
CREATE TABLE IF NOT EXISTS public.card_watchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  notification_preferences JSONB DEFAULT '{
    "card_updates": true,
    "comments": true,
    "due_date": true,
    "assignments": true,
    "attachments": false
  }',
  added_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'mention', 'card_update', 'due_date', 'new_member', 'comment', 
    'assignment', 'attachment', 'checklist_complete', 'board_invite'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.card_comments(id) ON DELETE CASCADE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  is_push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_activity table
CREATE TABLE IF NOT EXISTS public.board_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'card_created', 'card_updated', 'card_moved', 'card_deleted',
    'comment_added', 'comment_edited', 'comment_deleted',
    'member_added', 'member_removed', 'member_role_changed',
    'list_created', 'list_updated', 'list_deleted',
    'label_created', 'label_updated', 'label_deleted',
    'attachment_uploaded', 'attachment_deleted',
    'checklist_item_added', 'checklist_item_completed',
    'board_settings_updated', 'board_archived', 'board_restored'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'card', 'comment', 'list', 'label', 'member', 'attachment', 'checklist', 'board'
  )),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_templates table
CREATE TABLE IF NOT EXISTS public.board_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'general', 'software', 'marketing', 'design', 'sales', 'support', 'custom'
  )),
  thumbnail_url TEXT,
  board_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, key)
);

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Boards policies
CREATE POLICY "Users can view accessible boards" ON public.boards
  FOR SELECT USING (
    owner_id = auth.uid() OR
    visibility = 'public' OR
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Board owners can manage boards" ON public.boards
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Board members can update boards" ON public.boards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = boards.id AND user_id = auth.uid() 
      AND (role = 'admin' OR role = 'member')
    )
  );

-- Board settings policies
CREATE POLICY "Board members can view settings" ON public.board_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = board_settings.board_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Board admins can manage settings" ON public.board_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = board_settings.board_id AND user_id = auth.uid() 
      AND (role = 'admin' OR role = 'owner')
    )
  );

-- Lists policies
CREATE POLICY "Board members can manage lists" ON public.lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = lists.board_id AND user_id = auth.uid()
    )
  );

-- Cards policies
CREATE POLICY "Board members can manage cards" ON public.cards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      JOIN public.lists l ON l.board_id = bm.board_id
      WHERE l.id = cards.list_id AND bm.user_id = auth.uid()
    )
  );

-- Labels policies
CREATE POLICY "Board members can manage labels" ON public.labels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = labels.board_id AND user_id = auth.uid()
    )
  );

-- Card labels policies
CREATE POLICY "Board members can manage card labels" ON public.card_labels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      JOIN public.lists l ON l.board_id = bm.board_id
      JOIN public.cards c ON c.list_id = l.id
      WHERE c.id = card_labels.card_id AND bm.user_id = auth.uid()
    )
  );

-- Card comments policies
CREATE POLICY "Board members can manage comments" ON public.card_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      JOIN public.lists l ON l.board_id = bm.board_id
      JOIN public.cards c ON c.list_id = l.id
      WHERE c.id = card_comments.card_id AND bm.user_id = auth.uid()
    )
  );

-- Board members policies
CREATE POLICY "Board members can view board members" ON public.board_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      WHERE bm.board_id = board_members.board_id AND bm.user_id = auth.uid()
    )
  );

CREATE POLICY "Board owners can manage members" ON public.board_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.boards 
      WHERE id = board_members.board_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Board admins can manage members" ON public.board_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      WHERE bm.board_id = board_members.board_id AND user_id = auth.uid() 
      AND bm.role = 'admin'
    )
  );

-- Card checklist policies
CREATE POLICY "Board members can manage checklist" ON public.card_checklist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      JOIN public.lists l ON l.board_id = bm.board_id
      JOIN public.cards c ON c.list_id = l.id
      WHERE c.id = card_checklist.card_id AND bm.user_id = auth.uid()
    )
  );

-- Card attachments policies
CREATE POLICY "Board members can manage attachments" ON public.card_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      JOIN public.lists l ON l.board_id = bm.board_id
      JOIN public.cards c ON c.list_id = l.id
      WHERE c.id = card_attachments.card_id AND bm.user_id = auth.uid()
    )
  );

-- Card watchers policies
CREATE POLICY "Board members can manage watchers" ON public.card_watchers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      JOIN public.lists l ON l.board_id = bm.board_id
      JOIN public.cards c ON c.list_id = l.id
      WHERE c.id = card_watchers.card_id AND bm.user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Board activity policies
CREATE POLICY "Board members can view activity" ON public.board_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = board_activity.board_id AND user_id = auth.uid()
    )
  );

-- Board templates policies
CREATE POLICY "Public templates are viewable" ON public.board_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own templates" ON public.board_templates
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can manage own templates" ON public.board_templates
  FOR ALL USING (created_by = auth.uid());

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON public.boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_visibility ON public.boards(visibility);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON public.boards(created_at);
CREATE INDEX IF NOT EXISTS idx_boards_is_archived ON public.boards(is_archived);

CREATE INDEX IF NOT EXISTS idx_lists_board_id ON public.lists(board_id);
CREATE INDEX IF NOT EXISTS idx_lists_position ON public.lists(board_id, position);
CREATE INDEX IF NOT EXISTS idx_lists_is_archived ON public.lists(is_archived);

CREATE INDEX IF NOT EXISTS idx_cards_list_id ON public.cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON public.cards(list_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_assigned_user_id ON public.cards(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_cards_due_date ON public.cards(due_date);
CREATE INDEX IF NOT EXISTS idx_cards_priority ON public.cards(priority);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON public.cards(created_by);
CREATE INDEX IF NOT EXISTS idx_cards_is_archived ON public.cards(is_archived);

CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON public.board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON public.board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_board_members_role ON public.board_members(board_id, role);

CREATE INDEX IF NOT EXISTS idx_labels_board_id ON public.labels(board_id);

CREATE INDEX IF NOT EXISTS idx_card_labels_card_id ON public.card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_label_id ON public.card_labels(label_id);

CREATE INDEX IF NOT EXISTS idx_card_comments_card_id ON public.card_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_comments_user_id ON public.card_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_comments_created_at ON public.card_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_card_comments_parent_id ON public.card_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_card_checklist_card_id ON public.card_checklist(card_id);
CREATE INDEX IF NOT EXISTS idx_card_checklist_position ON public.card_checklist(card_id, position);
CREATE INDEX IF NOT EXISTS idx_card_checklist_assigned_to ON public.card_checklist(assigned_to);

CREATE INDEX IF NOT EXISTS idx_card_attachments_card_id ON public.card_attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_attachments_uploaded_by ON public.card_attachments(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_card_watchers_card_id ON public.card_watchers(card_id);
CREATE INDEX IF NOT EXISTS idx_card_watchers_user_id ON public.card_watchers(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_board_activity_board_id ON public.board_activity(board_id);
CREATE INDEX IF NOT EXISTS idx_board_activity_user_id ON public.board_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_board_activity_action ON public.board_activity(action);
CREATE INDEX IF NOT EXISTS idx_board_activity_created_at ON public.board_activity(created_at);

CREATE INDEX IF NOT EXISTS idx_board_templates_category ON public.board_templates(category);
CREATE INDEX IF NOT EXISTS idx_board_templates_is_public ON public.board_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_board_templates_is_featured ON public.board_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_board_templates_rating ON public.board_templates(rating);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON public.user_preferences(category);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_boards_owner_archived ON public.boards(owner_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_cards_list_position ON public.cards(list_id, position);
CREATE INDEX IF NOT EXISTS idx_board_members_board_role ON public.board_members(board_id, role);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_comments_updated_at BEFORE UPDATE ON public.card_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_settings_updated_at BEFORE UPDATE ON public.board_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_checklist_updated_at BEFORE UPDATE ON public.card_checklist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_members_updated_at BEFORE UPDATE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON public.labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_templates_updated_at BEFORE UPDATE ON public.board_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log board activities
CREATE OR REPLACE FUNCTION log_board_activity()
RETURNS TRIGGER AS $$
DECLARE
  board_id_val UUID;
BEGIN
  -- Determine board_id based on the table
  IF TG_TABLE_NAME = 'boards' THEN
    board_id_val := NEW.id;
  ELSIF TG_TABLE_NAME = 'lists' THEN
    board_id_val := NEW.board_id;
  ELSIF TG_TABLE_NAME = 'cards' THEN
    SELECT l.board_id INTO board_id_val FROM public.lists l WHERE l.id = NEW.list_id;
  ELSIF TG_TABLE_NAME = 'card_comments' THEN
    SELECT l.board_id INTO board_id_val 
    FROM public.cards c
    JOIN public.lists l ON l.id = c.list_id
    WHERE c.id = NEW.card_id;
  ELSIF TG_TABLE_NAME = 'card_attachments' THEN
    SELECT l.board_id INTO board_id_val 
    FROM public.cards c
    JOIN public.lists l ON l.id = c.list_id
    WHERE c.id = NEW.card_id;
  ELSIF TG_TABLE_NAME = 'card_checklist' THEN
    SELECT l.board_id INTO board_id_val 
    FROM public.cards c
    JOIN public.lists l ON l.id = c.list_id
    WHERE c.id = NEW.card_id;
  ELSIF TG_TABLE_NAME = 'labels' THEN
    board_id_val := NEW.board_id;
  ELSIF TG_TABLE_NAME = 'board_members' THEN
    board_id_val := NEW.board_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.board_activity (
      board_id, user_id, action, entity_type, entity_id, new_values
    ) VALUES (
      board_id_val,
      auth.uid(),
      TG_TABLE_NAME || '_created',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.board_activity (
      board_id, user_id, action, entity_type, entity_id, old_values, new_values
    ) VALUES (
      board_id_val,
      auth.uid(),
      TG_TABLE_NAME || '_updated',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.board_activity (
      board_id, user_id, action, entity_type, entity_id, old_values
    ) VALUES (
      board_id_val,
      auth.uid(),
      TG_TABLE_NAME || '_deleted',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_boards_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_lists_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_cards_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_card_comments_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.card_comments
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_card_attachments_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.card_attachments
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_card_checklist_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.card_checklist
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_labels_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.labels
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

CREATE TRIGGER log_board_members_activity
  AFTER INSERT OR UPDATE OR DELETE ON public.board_members
  FOR EACH ROW EXECUTE FUNCTION log_board_activity();

-- Insert default board templates
INSERT INTO public.board_templates (name, description, category, is_public, board_data) VALUES
('Quadro Básico', 'Um quadro Kanban simples para começar', 'general', true, '{
  "title": "Meu Primeiro Quadro",
  "description": "Um quadro Kanban básico",
  "lists": [
    {"title": "A Fazer", "position": 0},
    {"title": "Em Progresso", "position": 1},
    {"title": "Concluído", "position": 2}
  ],
  "labels": [
    {"name": "Urgente", "color": "#EF4444"},
    {"name": "Importante", "color": "#F59E0B"},
    {"name": "Baixa Prioridade", "color": "#10B981"},
    {"name": "Bug", "color": "#DC2626"},
    {"name": "Melhoria", "color": "#8B5CF6"},
    {"name": "Documentação", "color": "#06B6D4"}
  ]
}'),
('Desenvolvimento de Software', 'Quadro para projetos de desenvolvimento', 'software', true, '{
  "title": "Projeto de Desenvolvimento",
  "description": "Quadro para gerenciar desenvolvimento de software",
  "lists": [
    {"title": "Backlog", "position": 0},
    {"title": "Sprint Planning", "position": 1},
    {"title": "Em Desenvolvimento", "position": 2},
    {"title": "Code Review", "position": 3},
    {"title": "Testes", "position": 4},
    {"title": "Pronto para Deploy", "position": 5},
    {"title": "Deployado", "position": 6}
  ],
  "labels": [
    {"name": "Bug", "color": "#EF4444"},
    {"name": "Feature", "color": "#10B981"},
    {"name": "Refatoração", "color": "#8B5CF6"},
    {"name": "Documentação", "color": "#06B6D4"},
    {"name": "Urgente", "color": "#DC2626"},
    {"name": "Baixa Prioridade", "color": "#6B7280"}
  ]
}'),
('Marketing', 'Quadro para campanhas de marketing', 'marketing', true, '{
  "title": "Campanha de Marketing",
  "description": "Quadro para gerenciar campanhas de marketing",
  "lists": [
    {"title": "Ideias", "position": 0},
    {"title": "Em Planejamento", "position": 1},
    {"title": "Em Produção", "position": 2},
    {"title": "Em Revisão", "position": 3},
    {"title": "Aprovado", "position": 4},
    {"title": "Publicado", "position": 5}
  ],
  "labels": [
    {"name": "Social Media", "color": "#8B5CF6"},
    {"name": "Email Marketing", "color": "#06B6D4"},
    {"name": "SEO", "color": "#10B981"},
    {"name": "Ads", "color": "#F59E0B"},
    {"name": "Conteúdo", "color": "#EF4444"},
    {"name": "Eventos", "color": "#DC2626"}
  ]
}')
ON CONFLICT DO NOTHING; 