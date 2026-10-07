import type { RequestEvent } from '@sveltejs/kit';
import { delete_session, insert_session, sql, user_by_session, type UserRow } from './db';

const te = new TextEncoder();

export async function hash(pass: string, salt?: string) {
	const s = salt ?? crypto.randomUUID();
	const key = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, [
		'deriveBits'
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: te.encode(s), iterations: 80_000, hash: 'SHA-256' },
		key,
		256
	);
	return `${s}:${btoa(String.fromCharCode(...new Uint8Array(bits)))}`;
}

export async function check(pass: string, stored: string) {
	const salt = stored.split(':')[0];
	return (await hash(pass, salt)) === stored;
}

export async function token_id(tok: string) {
	const buf = await crypto.subtle.digest('SHA-256', te.encode(tok));
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function rand_tok() {
	const b = crypto.getRandomValues(new Uint8Array(32));
	return btoa(String.fromCharCode(...b))
		.replaceAll('+', '-')
		.replaceAll('/', '_')
		.replaceAll('=', '');
}

export async function write_session(e: RequestEvent, id: string) {
	const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
	const tok = rand_tok();
	e.cookies.set('ahh', tok, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: e.url.protocol === 'https:',
		maxAge: 30 * 24 * 60 * 60
	});
	await insert_session(sql(e.platform), await token_id(tok), id, exp);
}

export async function clear_session(e: RequestEvent) {
	const tok = e.cookies.get('ahh');
	if (tok && e.platform?.env?.DB) await delete_session(sql(e.platform), await token_id(tok));
	e.cookies.delete('ahh', { path: '/' });
}

export async function read_session(e: RequestEvent) {
	const tok = e.cookies.get('ahh');
	if (!tok || !e.platform?.env?.DB) return null;
	return user_by_session(sql(e.platform), await token_id(tok));
}

export function public_user(u: UserRow) {
	return {
		id: u.id,
		email: u.email,
		created_at: u.created_at,
		p: !!u.pass, // p: has a password
		user_metadata: {
			username: u.username,
			display_name: u.display_name,
			bio: u.bio,
			avatar_url: u.avatar_url,
			location: u.location,
			website_url: u.website_url
		}
	};
}

export function j(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

export function owned(r: 'ok' | 'not found' | 'forbidden') {
	return r === 'ok' ? j({ ok: true }) : j({ error: r }, r === 'forbidden' ? 403 : 404);
}
