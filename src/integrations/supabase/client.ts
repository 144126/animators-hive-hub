// Supabase client — credentials come from environment, never hardcoded.
// Required: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
// (VITE_SUPABASE_ANON_KEY is accepted as a fallback alias for the publishable key).
// Local dev: copy .env.example to .env. Cloudflare Pages: set both as
// Environment variables (Production + Preview).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env (local) or in Cloudflare Pages → Settings → Environment variables.'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);