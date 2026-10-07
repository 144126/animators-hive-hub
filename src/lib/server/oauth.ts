import { error, type RequestEvent } from '@sveltejs/kit';
import { Google, generateState, generateCodeVerifier } from 'arctic';
import { google_redirect_uri } from '$lib/util/oauth/google_redirect_uri';

export function google_client(e: RequestEvent): Google {
	const id = e.platform?.env?.GOOGLE_ID;
	const secret = e.platform?.env?.GOOGLE_SECRET;
	if (!id || !secret) throw error(500, 'missing google oauth');
	return new Google(id, secret, google_redirect_uri(e.url.origin));
}

export { generateState, generateCodeVerifier };
