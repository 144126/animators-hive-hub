import type { RequestHandler } from './$types';
import { comm_by_slug, set_member, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const POST: RequestHandler = async ({ params, request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { o?: boolean }; // o: on
	const d = sql(platform);
	const c = await comm_by_slug(d, params.name, locals.user.id);
	if (!c) return j({ error: 'not found' }, 404);
	const r = await set_member(d, locals.user.id, c.id, !!body.o);
	if (r !== 'ok') return j({ error: r }, 404);
	return j({ item: await comm_by_slug(d, params.name, locals.user.id) });
};
