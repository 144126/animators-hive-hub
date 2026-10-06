import type { RequestHandler } from './$types';
import { cat_add, cat_ids, db, many, parse, put, type ItemRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { playlist_id?: string; animation_id?: string };
	if (!body.playlist_id || !body.animation_id) return j({ error: 'missing' }, 400);
	const d = db(platform);
	const exists = (await many(d, await cat_ids(d, 'i')))
		.map((r) => parse<ItemRow>(r))
		.some((x) => x && x.playlist_id === body.playlist_id && x.animation_id === body.animation_id);
	if (exists) return j({ error: 'duplicate key value' }, 400);
	const row: ItemRow = { id: crypto.randomUUID(), playlist_id: body.playlist_id, animation_id: body.animation_id };
	await put(d, row.id, { k: 'i', j: JSON.stringify(row) });
	await cat_add(d, 'i', row.id);
	return j({ item: row });
};
