import { error, type RequestEvent } from '@sveltejs/kit';
import { parse, type UserRow } from './db';

const te = new TextEncoder();

function secret(e: RequestEvent) {
	const s = e.platform?.env?.SESSION_SECRET;
	if (!s) throw error(500, 'missing SESSION_SECRET');
	return s;
}

export async function hash(pass: string, salt?: string) {
	const s = salt ?? crypto.randomUUID();
	const key = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveBits']);
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

async function sign(msg: string, key: string) {
	const k = await crypto.subtle.importKey('raw', te.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	const mac = await crypto.subtle.sign('HMAC', k, te.encode(msg));
	return btoa(String.fromCharCode(...new Uint8Array(mac)));
}

export async function write_session(e: RequestEvent, id: string) {
	const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
	const msg = `${id}.${exp}`;
	const tok = `${msg}.${await sign(msg, secret(e))}`;
	e.cookies.set('ahh', tok, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: e.url.protocol === 'https:',
		maxAge: 30 * 24 * 60 * 60
	});
}

export function clear_session(e: RequestEvent) {
	e.cookies.delete('ahh', { path: '/' });
}

export async function read_session(e: RequestEvent) {
	const tok = e.cookies.get('ahh');
	if (!tok) return null;
	const i = tok.lastIndexOf('.');
	if (i < 0) return null;
	const msg = tok.slice(0, i);
	const mac = tok.slice(i + 1);
	if ((await sign(msg, secret(e))) !== mac) return null;
	const [id, exp] = msg.split('.');
	if (!id || Date.now() > Number(exp)) return null;
	return id;
}

export function public_user(u: UserRow) {
	return {
		id: u.id,
		email: u.email,
		created_at: u.created_at,
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

export function need_user(e: RequestEvent) {
	if (!e.locals.user) {
		throw new Response(JSON.stringify({ error: 'sign in required' }), {
			status: 401,
			headers: { 'content-type': 'application/json' }
		});
	}
	return e.locals.user;
}

export function j(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

export { parse };
