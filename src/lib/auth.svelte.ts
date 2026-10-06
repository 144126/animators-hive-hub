import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { toast } from './toast.svelte';

let user = $state<User | null>(null);
let session = $state<Session | null>(null);
let loading = $state(true);
let started = false;

async function ensure_profile(u: User) {
	const { data: existing, error: fetch_err } = await supabase
		.from('users')
		.select('id')
		.eq('id', u.id)
		.maybeSingle();
	if (fetch_err || existing) return;

	let username =
		u.user_metadata.full_name?.replace(/\s/g, '').toLowerCase() ||
		u.email?.split('@')[0] ||
		`user${Date.now()}`;
	let attempt = 1;
	let candidate = username;
	for (;;) {
		const { data } = await supabase.from('users').select('username').eq('username', candidate).maybeSingle();
		if (!data) break;
		candidate = `${username}${attempt++}`;
	}

	const { error } = await supabase.from('users').upsert(
		{
			id: u.id,
			username: candidate,
			display_name: u.user_metadata.full_name || candidate,
			avatar_url: u.user_metadata.avatar_url
		},
		{ onConflict: 'id', ignoreDuplicates: true }
	);
	if (error && error.code !== '23505') {
		toast('profile creation error', 'could not create your user profile.', 'err');
	}
}

export function auth() {
	if (!started) {
		started = true;
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
			user = data.session?.user ?? null;
			loading = false;
		});
		supabase.auth.onAuthStateChange((event, s) => {
			session = s;
			user = s?.user ?? null;
			loading = false;
			if (event === 'SIGNED_IN' && s?.user) {
				setTimeout(() => {
					ensure_profile(s.user).catch(() => {});
				}, 100);
			}
		});
	}
	return {
		get user() {
			return user;
		},
		get session() {
			return session;
		},
		get loading() {
			return loading;
		}
	};
}

export async function sign_up(email: string, password: string, username: string) {
	loading = true;
	try {
		const { data: taken } = await supabase.from('users').select('username').eq('username', username).maybeSingle();
		if (taken) throw new Error('username is already taken');
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { username } }
		});
		if (error) throw error;
		if (data.user && !data.session) {
			toast('account created!', 'please check your email to verify your account.');
		} else if (data.user && data.session) {
			const { error: profile_err } = await supabase.from('users').insert({
				id: data.user.id,
				username,
				display_name: username
			});
			if (profile_err) toast('profile creation error', 'account created but profile creation failed.', 'err');
			else toast('account created!', 'welcome to the animation community!');
		}
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign up failed', 'err');
		throw e;
	} finally {
		loading = false;
	}
}

export async function sign_in(email: string, password: string) {
	loading = true;
	try {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) throw error;
		toast('welcome back!', 'you have been signed in successfully.');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign in failed', 'err');
		throw e;
	} finally {
		loading = false;
	}
}

export async function sign_in_google() {
	loading = true;
	try {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: window.location.origin }
		});
		if (error) throw error;
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'google sign in failed', 'err');
		loading = false;
	}
}

export async function sign_out() {
	loading = true;
	try {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		toast('signed out', 'you have been signed out successfully.');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign out failed', 'err');
	} finally {
		loading = false;
	}
}

export function display_name(u: User | null) {
	if (!u) return 'user';
	return u.user_metadata?.display_name || u.user_metadata?.username || u.email?.split('@')[0] || 'user';
}
