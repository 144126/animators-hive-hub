import type { RequestHandler } from './$types';
import { generateCodeVerifier, generateState, google_client } from '$lib/server/oauth';

export const GET: RequestHandler = (e) => {
	const state = generateState();
	const verifier = generateCodeVerifier();
	const url = google_client(e).createAuthorizationURL(state, verifier, ['openid', 'profile', 'email']);
	const opt = { path: '/', httpOnly: true, maxAge: 600, sameSite: 'lax' as const };
	e.cookies.set('oauth_state', state, opt);
	e.cookies.set('oauth_verifier', verifier, opt);
	return new Response(null, { status: 302, headers: { location: url.toString() } });
};
