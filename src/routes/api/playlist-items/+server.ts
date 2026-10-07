import type { RequestHandler } from './$types';
import { insert_item, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

const code: Record<string, number> = {
	ok: 200,
	'not found': 404,
	'not your playlist': 403,
	'duplicate key value': 400
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { playlist_id?: string; animation_id?: string };
	if (!body.playlist_id || !body.animation_id) return j({ error: 'missing' }, 400);
	const r = await insert_item(sql(platform), locals.user.id, body.playlist_id, body.animation_id);
	return r === 'ok' ? j({ ok: true }) : j({ error: r }, code[r]);
};
