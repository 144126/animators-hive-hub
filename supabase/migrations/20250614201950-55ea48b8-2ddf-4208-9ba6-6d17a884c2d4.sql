
-- Only add the missing foreign key constraint for posts_community_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_community_id_fkey' 
        AND table_name = 'posts'
    ) THEN
        ALTER TABLE public.posts 
        ADD CONSTRAINT posts_community_id_fkey 
        FOREIGN KEY (community_id) REFERENCES public.communities(id);
    END IF;
END $$;

-- Only add the missing foreign key constraint for communities_creator_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'communities_creator_id_fkey' 
        AND table_name = 'communities'
    ) THEN
        ALTER TABLE public.communities 
        ADD CONSTRAINT communities_creator_id_fkey 
        FOREIGN KEY (creator_id) REFERENCES public.users(id);
    END IF;
END $$;

-- Create comments table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

-- Enable Row Level Security for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for comments table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Anyone can view comments') THEN
        EXECUTE 'CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Authenticated users can create comments') THEN
        EXECUTE 'CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = ''authenticated'' AND auth.uid() = author_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Comment authors can update their comments') THEN
        EXECUTE 'CREATE POLICY "Comment authors can update their comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Comment authors can delete their comments') THEN
        EXECUTE 'CREATE POLICY "Comment authors can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = author_id)';
    END IF;
END $$;

-- Create trigger for updated_at on comments (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_comments_updated_at' AND event_object_table = 'comments') THEN
        EXECUTE 'CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;
END $$;
