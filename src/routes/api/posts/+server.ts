import type { RequestHandler } from './$types';
import { cat_ids, db, hydrate, many, parse, type AnimRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, platform }) => {
	const d = db(platform);
	const sort = url.searchParams.get('sort') === 'top' ? 'top' : 'new';
	const community_id = url.searchParams.get('community_id') || '';
	const rows = (await many(d, await cat_ids(d, 'p'))).map((r) => parse<AnimRow>(r)).filter((x): x is AnimRow => !!x);
	const filtered = rows.filter((r) => !community_id || r.community_id === community_id);
	filtered.sort((a, b) =>
		sort === 'top' ? b.upvote_count - a.upvote_count : Date.parse(b.created_at) - Date.parse(a.created_at)
	);
	return j({ items: await Promise.all(filtered.slice(0, 20).map((r) => hydrate(d, r))) });
};
