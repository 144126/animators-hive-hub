
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  creator_id UUID REFERENCES public.users(id) NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  community_id UUID REFERENCES public.communities(id),
  upvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id) NOT NULL,
  parent_id UUID REFERENCES public.comments(id),
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create upvotes table
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id),
  comment_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK ((post_id IS NOT NULL) OR (comment_id IS NOT NULL)),
  CHECK (NOT (post_id IS NOT NULL AND comment_id IS NOT NULL))
);

-- Create playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.users(id) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create playlist_items table
CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) NOT NULL,
  post_id UUID REFERENCES public.posts(id) NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON public.upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_post_id ON public.upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_comment_id ON public.upvotes(comment_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for communities table
CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Community creators can update their communities" ON public.communities FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for posts table
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);
CREATE POLICY "Post authors can update their posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Post authors can delete their posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for comments table
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);
CREATE POLICY "Comment authors can update their comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Comment authors can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for upvotes table
CREATE POLICY "Anyone can view upvotes" ON public.upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage their upvotes" ON public.upvotes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for playlists table
CREATE POLICY "Anyone can view public playlists" ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = creator_id);
CREATE POLICY "Authenticated users can create playlists" ON public.playlists FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = creator_id);
CREATE POLICY "Playlist creators can update their playlists" ON public.playlists FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Playlist creators can delete their playlists" ON public.playlists FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for playlist_items table
CREATE POLICY "Anyone can view playlist items for public playlists" ON public.playlist_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND (playlists.is_public = true OR playlists.creator_id = auth.uid())
  )
);
CREATE POLICY "Playlist creators can manage playlist items" ON public.playlist_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.playlists 
    WHERE playlists.id = playlist_items.playlist_id 
    AND playlists.creator_id = auth.uid()
  )
);

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
