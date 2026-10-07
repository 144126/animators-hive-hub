import { error, type RequestEvent } from '@sveltejs/kit';
import { delete_session, insert_session, session_user, sql, type UserRow } from './db';

const te = new TextEncoder();

function secret(e: RequestEvent) {
	const s = e.platform?.env?.SESSION_SECRET;
	if (!s) throw error(500, 'missing SESSION_SECRET');
	return s;
}

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

async function sign(msg: string, key: string) {
	const k = await crypto.subtle.importKey(
		'raw',
		te.encode(key),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const mac = await crypto.subtle.sign('HMAC', k, te.encode(msg));
	return btoa(String.fromCharCode(...new Uint8Array(mac)));
}

export async function token_id(tok: string) {
	const buf = await crypto.subtle.digest('SHA-256', te.encode(tok));
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
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
	await insert_session(sql(e.platform), await token_id(tok), id, exp);
}

export async function clear_session(e: RequestEvent) {
	const tok = e.cookies.get('ahh');
	if (tok && e.platform?.env?.DB) await delete_session(sql(e.platform), await token_id(tok));
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
	if (!id || Date.now() > Number(exp) || !e.platform?.env?.DB) return null;
	const uid = await session_user(sql(e.platform), await token_id(tok));
	return uid === id ? id : null;
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
