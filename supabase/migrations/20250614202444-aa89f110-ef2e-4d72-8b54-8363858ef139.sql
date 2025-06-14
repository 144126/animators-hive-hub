
-- Create upvotes table to track user upvotes on posts
CREATE TABLE public.upvotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id) -- Ensure a user can only upvote a post once
);

-- Enable RLS on upvotes table
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;

-- Allow users to view all upvotes (needed for counting)
CREATE POLICY "Users can view upvotes" 
  ON public.upvotes 
  FOR SELECT 
  USING (true);

-- Allow users to create upvotes for their own user_id
CREATE POLICY "Users can create their own upvotes" 
  ON public.upvotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own upvotes
CREATE POLICY "Users can delete their own upvotes" 
  ON public.upvotes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update post upvote counts
CREATE OR REPLACE FUNCTION update_post_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET upvote_count = upvote_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET upvote_count = upvote_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update upvote counts
CREATE TRIGGER upvote_count_trigger
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_upvote_count();
