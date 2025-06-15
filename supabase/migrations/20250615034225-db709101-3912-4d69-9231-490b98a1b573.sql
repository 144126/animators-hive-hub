
-- Only create missing RLS policies (avoid conflicts with existing ones)

-- Check and enable RLS on all tables (this is safe to run multiple times)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies that are likely missing (using IF NOT EXISTS pattern)
DO $$ 
BEGIN
    -- Communities policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'Anyone can view communities') THEN
        EXECUTE 'CREATE POLICY "Anyone can view communities" ON public.communities FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'Authenticated users can create communities') THEN
        EXECUTE 'CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = creator_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'Creators can update their communities') THEN
        EXECUTE 'CREATE POLICY "Creators can update their communities" ON public.communities FOR UPDATE USING (auth.uid() = creator_id)';
    END IF;

    -- Posts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Anyone can view posts') THEN
        EXECUTE 'CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Authenticated users can create posts') THEN
        EXECUTE 'CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Authors can update their posts') THEN
        EXECUTE 'CREATE POLICY "Authors can update their posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Authors can delete their posts') THEN
        EXECUTE 'CREATE POLICY "Authors can delete their posts" ON public.posts FOR DELETE USING (auth.uid() = author_id)';
    END IF;

    -- Animations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animations' AND policyname = 'Anyone can view animations') THEN
        EXECUTE 'CREATE POLICY "Anyone can view animations" ON public.animations FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animations' AND policyname = 'Authenticated users can create animations') THEN
        EXECUTE 'CREATE POLICY "Authenticated users can create animations" ON public.animations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animations' AND policyname = 'Authors can update their animations') THEN
        EXECUTE 'CREATE POLICY "Authors can update their animations" ON public.animations FOR UPDATE USING (auth.uid() = author_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animations' AND policyname = 'Authors can delete their animations') THEN
        EXECUTE 'CREATE POLICY "Authors can delete their animations" ON public.animations FOR DELETE USING (auth.uid() = author_id)';
    END IF;

    -- Upvotes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'upvotes' AND policyname = 'Users can view upvotes') THEN
        EXECUTE 'CREATE POLICY "Users can view upvotes" ON public.upvotes FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'upvotes' AND policyname = 'Authenticated users can create upvotes') THEN
        EXECUTE 'CREATE POLICY "Authenticated users can create upvotes" ON public.upvotes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'upvotes' AND policyname = 'Users can delete own upvotes') THEN
        EXECUTE 'CREATE POLICY "Users can delete own upvotes" ON public.upvotes FOR DELETE USING (auth.uid() = user_id)';
    END IF;

    -- Playlists policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlists' AND policyname = 'Users can view playlists') THEN
        EXECUTE 'CREATE POLICY "Users can view playlists" ON public.playlists FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlists' AND policyname = 'Authenticated users can create playlists') THEN
        EXECUTE 'CREATE POLICY "Authenticated users can create playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlists' AND policyname = 'Users can update own playlists') THEN
        EXECUTE 'CREATE POLICY "Users can update own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlists' AND policyname = 'Users can delete own playlists') THEN
        EXECUTE 'CREATE POLICY "Users can delete own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id)';
    END IF;

    -- Playlist items policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlist_items' AND policyname = 'Users can view playlist items') THEN
        EXECUTE 'CREATE POLICY "Users can view playlist items" ON public.playlist_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = playlist_items.playlist_id))';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlist_items' AND policyname = 'Users can add items to own playlists') THEN
        EXECUTE 'CREATE POLICY "Users can add items to own playlists" ON public.playlist_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = playlist_items.playlist_id AND playlists.user_id = auth.uid()))';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'playlist_items' AND policyname = 'Users can delete items from own playlists') THEN
        EXECUTE 'CREATE POLICY "Users can delete items from own playlists" ON public.playlist_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.playlists WHERE playlists.id = playlist_items.playlist_id AND playlists.user_id = auth.uid()))';
    END IF;
END $$;

-- Create a security validation function
CREATE OR REPLACE FUNCTION public.validate_content_security(content_text TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for potential XSS patterns
  IF content_text ~* '<script|javascript:|on\w+\s*=' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for SQL injection patterns
  IF content_text ~* '(union\s+select|drop\s+table|delete\s+from|insert\s+into|update\s+\w+\s+set)' THEN
    RETURN FALSE;
  END IF;
  
  -- Content passes basic security checks
  RETURN TRUE;
END;
$$;
