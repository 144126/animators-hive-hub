import { invalidateAll } from '$app/navigation';
import { page } from '$app/state';
import { api } from './http';
import { toast } from './toast.svelte';
import type { AuthUser } from './types';

export function auth() {
	return {
		get user(): AuthUser | null {
			return page.data.u ?? null;
		}
	};
}

export async function sign_up(email: string, password: string, username: string) {
	try {
		await api('/api/auth/signup', {
			method: 'POST',
			body: JSON.stringify({ email, password, username })
		});
		await invalidateAll();
		toast('account created!', 'welcome to the animation community!');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign up failed', 'err');
		throw e;
	}
}

export async function sign_in(email: string, password: string) {
	try {
		await api('/api/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) });
		await invalidateAll();
		toast('welcome back!', 'you have been signed in successfully.');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign in failed', 'err');
		throw e;
	}
}

export async function sign_out() {
	try {
		await api('/api/auth/signout', { method: 'POST' });
		await invalidateAll();
		toast('signed out', 'you have been signed out successfully.');
	} catch (e) {
		toast('error', e instanceof Error ? e.message : 'sign out failed', 'err');
	}
}

export function display_name(u: AuthUser | null) {
	if (!u) return 'user';
	return (
		u.user_metadata?.display_name || u.user_metadata?.username || u.email?.split('@')[0] || 'user'
	);
}
