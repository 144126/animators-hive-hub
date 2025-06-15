
-- Fix Function Search Path Mutable warnings by updating all functions with secure search_path

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Update update_post_upvote_count function
CREATE OR REPLACE FUNCTION public.update_post_upvote_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update is_playlist_owner function
CREATE OR REPLACE FUNCTION public.is_playlist_owner(p_playlist_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.playlists
    WHERE id = p_playlist_id AND user_id = auth.uid()
  );
END;
$function$;

-- Update update_animation_upvote_count function
CREATE OR REPLACE FUNCTION public.update_animation_upvote_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;
