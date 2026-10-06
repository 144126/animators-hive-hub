import type { RequestHandler } from './$types';
import { cat_ids, db, hydrate, many, one, parse, type AnimRow, type ItemRow, type ListRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, platform }) => {
	const d = db(platform);
	const list = parse<ListRow>(await one(d, params.id));
	if (!list) return j({ error: 'not found' }, 404);
	const items = (await many(d, await cat_ids(d, 'i')))
		.map((r) => parse<ItemRow>(r))
		.filter((x): x is ItemRow => !!x && x.playlist_id === params.id);
	const anims = await Promise.all(
		items.map(async (it) => {
			const a = parse<AnimRow>(await one(d, it.animation_id));
			return { id: it.id, animations: a ? await hydrate(d, a) : null };
		})
	);
	return j({ item: list, items: anims });
};
