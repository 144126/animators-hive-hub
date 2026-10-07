import { api } from './http';
import { toast } from './toast.svelte';
import type { AuthUser } from './types';

let user = $state<AuthUser | null>(null);
let loading = $state(true);
let started = false;

export function auth() {
	if (!started) {
		started = true;
		api<{ user: AuthUser | null }>('/api/me')
			.then((d) => {
				user = d.user;
			})
			.catch(() => {
				user = null;
			})
			.finally(() => {
				loading = false;
			});
	}
	return {
		get user() {
			return user;
		},
		get session() {
			return user ? { user } : null;
		},
		get loading() {
			return loading;
		}
	};
}

export async function sign_up(email: string, password: string, username: string) {
	loading = true;
	try {
		const d = await api<{ user: AuthUser }>('/api/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ email, password, username })
		});
		user = d.user;
		toast('account created!', 'welcome to the animation community!');
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
		const d = await api<{ user: AuthUser }>('/api/auth/signin', {
			method: 'POST',
			body: JSON.stringify({ email, password })
		});
		user = d.user;
		toast('welcome back!', 'you have been signed in successfully.');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign in failed', 'err');
		throw e;
	} finally {
		loading = false;
	}
}

export async function sign_out() {
	loading = true;
	try {
		await api('/api/auth/signout', { method: 'POST' });
		user = null;
		toast('signed out', 'you have been signed out successfully.');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign out failed', 'err');
	} finally {
		loading = false;
	}
}

export function display_name(u: AuthUser | null) {
	if (!u) return 'user';
	return (
		u.user_metadata?.display_name || u.user_metadata?.username || u.email?.split('@')[0] || 'user'
	);
}

export function set_user(u: AuthUser | null) {
	user = u;
}
