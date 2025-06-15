
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Create proper RLS policies for the users table
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.users FOR DELETE 
USING (auth.uid() = id);
