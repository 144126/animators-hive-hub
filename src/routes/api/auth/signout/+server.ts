import type { RequestHandler } from './$types';
import { clear_session, j } from '$lib/server/session';

export const POST: RequestHandler = async (e) => {
	clear_session(e);
	return j({ ok: true });
};
