
-- Create playlists table to store user-created playlists
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add a trigger to automatically update the 'updated_at' column
CREATE TRIGGER handle_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Enable Row Level Security on the playlists table
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

-- Policies for playlists table
CREATE POLICY "Users can view their own playlists"
  ON public.playlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON public.playlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON public.playlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON public.playlists FOR DELETE
  USING (auth.uid() = user_id);

-- Create a join table to link animations (posts) to playlists
CREATE TABLE public.playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Ensure an animation can only be in a playlist once
  UNIQUE (playlist_id, post_id)
);

-- Enable Row Level Security on the playlist_items table
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user owns a specific playlist
CREATE OR REPLACE FUNCTION public.is_playlist_owner(p_playlist_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.playlists
    WHERE id = p_playlist_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for playlist_items table
CREATE POLICY "Users can view items in their own playlists"
  ON public.playlist_items FOR SELECT
  USING (public.is_playlist_owner(playlist_id));

CREATE POLICY "Users can add items to their own playlists"
  ON public.playlist_items FOR INSERT
  WITH CHECK (public.is_playlist_owner(playlist_id));

CREATE POLICY "Users can remove items from their own playlists"
  ON public.playlist_items FOR DELETE
  USING (public.is_playlist_owner(playlist_id));
