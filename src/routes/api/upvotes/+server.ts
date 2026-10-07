import type { RequestHandler } from './$types';
import { fails, has_vote, set_vote, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const target = url.searchParams.get('target') || '';
	if (!locals.user || !target) return j({ voted: false });
	return j({ voted: await has_vote(sql(platform), locals.user.id, target) });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { target?: string; on?: boolean };
	if (!body.target) return j({ error: 'missing' }, 400);
	try {
		await set_vote(sql(platform), locals.user.id, body.target, !!body.on);
	} catch (e) {
		if (fails(e, 'FOREIGN KEY')) return j({ error: 'not found' }, 404);
		throw e;
	}
	return j({ ok: true });
};
