-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
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
  allow_comments BOOLEAN DEFAULT true,
  allow_invites BOOLEAN DEFAULT true,
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
    "newMembers": true
  }',
  permissions JSONB DEFAULT '{
    "allowMemberInvites": true,
    "allowCardDeletion": false,
    "allowListDeletion": false,
    "requireApproval": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id)
);

-- Create lists table
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
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
  assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_labels junction table
CREATE TABLE IF NOT EXISTS public.card_labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, label_id)
);

-- Create card_comments table
CREATE TABLE IF NOT EXISTS public.card_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_members table
CREATE TABLE IF NOT EXISTS public.board_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, user_id)
);

-- Create card_checklist table
CREATE TABLE IF NOT EXISTS public.card_checklist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_attachments table
CREATE TABLE IF NOT EXISTS public.card_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_watchers table
CREATE TABLE IF NOT EXISTS public.card_watchers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id, user_id)
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

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Boards policies
CREATE POLICY "Users can view boards they have access to" ON public.boards
  FOR SELECT USING (
    owner_id = auth.uid() OR
    visibility = 'public' OR
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = boards.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Board owners can manage their boards" ON public.boards
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Board members can update boards" ON public.boards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.board_members 
      WHERE board_id = boards.id AND user_id = auth.uid() AND role IN ('admin', 'member')
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
      WHERE board_id = board_settings.board_id AND user_id = auth.uid() AND role = 'admin'
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

CREATE POLICY "Board admins can manage members" ON public.board_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.board_members bm
      WHERE bm.board_id = board_members.board_id AND bm.user_id = auth.uid() AND bm.role = 'admin'
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_owner_id ON public.boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON public.lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON public.cards(list_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_card_id ON public.card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_comments_card_id ON public.card_comments(card_id);
CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON public.board_members(board_id);
CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON public.board_members(user_id);

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

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 