import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { Database } from './database.types';

const url =
	env.PUBLIC_SUPABASE_URL ||
	(import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
	(import.meta.env.PUBLIC_SUPABASE_URL as string | undefined);
const key =
	env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
	env.PUBLIC_SUPABASE_ANON_KEY ||
	(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
	(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
	(import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined);

if (!url || !key) {
	throw new Error(
		'missing supabase env. set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY'
	);
}

export const supabase = createClient<Database>(url, key, {
	auth: {
		persistSession: browser,
		autoRefreshToken: browser,
		detectSessionInUrl: browser
	}
});
