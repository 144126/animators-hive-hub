import type { RequestHandler } from './$types';
import { delete_item, insert_item, sql } from '$lib/server/db';
import { j, owned } from '$lib/server/session';

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

export const DELETE: RequestHandler = async ({ url, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	return owned(await delete_item(sql(platform), locals.user.id, url.searchParams.get('id') || ''));
};
