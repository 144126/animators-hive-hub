
-- Create storage bucket for animation videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('animation-videos', 'animation-videos', true);

-- Create storage bucket for animation thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('animation-thumbnails', 'animation-thumbnails', true);

-- Create RLS policies for animation videos bucket
CREATE POLICY "Anyone can view animation videos" ON storage.objects
FOR SELECT USING (bucket_id = 'animation-videos');

CREATE POLICY "Authenticated users can upload animation videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'animation-videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own animation videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'animation-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animation videos" ON storage.objects
FOR DELETE USING (bucket_id = 'animation-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for animation thumbnails bucket
CREATE POLICY "Anyone can view animation thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'animation-thumbnails');

CREATE POLICY "Authenticated users can upload animation thumbnails" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'animation-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own animation thumbnails" ON storage.objects
FOR UPDATE USING (bucket_id = 'animation-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animation thumbnails" ON storage.objects
FOR DELETE USING (bucket_id = 'animation-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);
