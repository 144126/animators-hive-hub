
-- Create animations table (replacing posts for animations)
CREATE TABLE IF NOT EXISTS public.animations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  community_id UUID REFERENCES public.communities(id),
  upvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update comments table to reference animations instead of posts
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS animation_id UUID;
ALTER TABLE public.comments ADD CONSTRAINT comments_animation_id_fkey FOREIGN KEY (animation_id) REFERENCES public.animations(id);

-- Update upvotes table to support animations
ALTER TABLE public.upvotes DROP CONSTRAINT IF EXISTS upvotes_post_id_fkey;
ALTER TABLE public.upvotes ADD COLUMN IF NOT EXISTS animation_id UUID;
ALTER TABLE public.upvotes ADD CONSTRAINT upvotes_animation_id_fkey FOREIGN KEY (animation_id) REFERENCES public.animations(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animations_community_id ON public.animations(community_id);
CREATE INDEX IF NOT EXISTS idx_animations_author_id ON public.animations(author_id);
CREATE INDEX IF NOT EXISTS idx_animations_created_at ON public.animations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_animation_id ON public.comments(animation_id);

-- Enable Row Level Security for animations
ALTER TABLE public.animations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animations table
CREATE POLICY "Anyone can view animations" ON public.animations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create animations" ON public.animations FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);
CREATE POLICY "Animation authors can update their animations" ON public.animations FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Animation authors can delete their animations" ON public.animations FOR DELETE USING (auth.uid() = author_id);

-- Create function to update animation upvote counts
CREATE OR REPLACE FUNCTION update_animation_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.animations 
    SET upvote_count = upvote_count + 1 
    WHERE id = NEW.animation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.animations 
    SET upvote_count = upvote_count - 1 
    WHERE id = OLD.animation_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update animation upvote counts
CREATE TRIGGER animation_upvote_count_trigger
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW
  EXECUTE FUNCTION update_animation_upvote_count();

-- Create trigger for updated_at on animations
CREATE TRIGGER update_animations_updated_at 
  BEFORE UPDATE ON public.animations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
