import type { RequestHandler } from './$types';
import { google_client } from '$lib/server/oauth';
import { find_or_create_google, sql } from '$lib/server/db';
import { write_session } from '$lib/server/session';

export const GET: RequestHandler = async (e) => {
	const code = e.url.searchParams.get('code');
	const state = e.url.searchParams.get('state');
	const stored_state = e.cookies.get('oauth_state') ?? null;
	const stored_verifier = e.cookies.get('oauth_verifier') ?? null;
	if (!code || !state || !stored_state || !stored_verifier || state !== stored_state) {
		return new Response(null, { status: 400 });
	}
	let tokens: { accessToken(): string };
	try {
		tokens = await google_client(e).validateAuthorizationCode(code, stored_verifier);
	} catch {
		return new Response(null, { status: 400 });
	}
	const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
		headers: { authorization: `Bearer ${tokens.accessToken()}` }
	});
	if (!res.ok) return new Response(null, { status: 400 });
	const g = (await res.json()) as {
		email?: string;
		name?: string;
		picture?: string;
		email_verified?: boolean;
	};
	if (!g.email) return new Response(null, { status: 400 });
	if (g.email_verified !== true) return new Response('google email not verified', { status: 400 });
	const u = await find_or_create_google(sql(e.platform), {
		email: g.email,
		name: g.name || '',
		picture: g.picture || ''
	});
	await write_session(e, u.id);
	e.cookies.delete('oauth_state', { path: '/' });
	e.cookies.delete('oauth_verifier', { path: '/' });
	return new Response(null, { status: 302, headers: { location: '/' } });
};
