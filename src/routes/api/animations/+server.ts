import type { RequestHandler } from './$types';
import { cat_add, cat_ids, db, hydrate, many, parse, put, type AnimRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, platform }) => {
	const d = db(platform);
	const sort = url.searchParams.get('sort') === 'top' ? 'top' : 'new';
	const community_id = url.searchParams.get('community_id') || '';
	const author_id = url.searchParams.get('author_id') || '';
	const ids = await cat_ids(d, 'a');
	const rows = (await many(d, ids)).map((r) => parse<AnimRow>(r)).filter((x): x is AnimRow => !!x);
	const filtered = rows.filter((r) => (!community_id || r.community_id === community_id) && (!author_id || r.author_id === author_id));
	filtered.sort((a, b) =>
		sort === 'top' ? b.upvote_count - a.upvote_count : Date.parse(b.created_at) - Date.parse(a.created_at)
	);
	return j({ items: await Promise.all(filtered.slice(0, 20).map((r) => hydrate(d, r))) });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as {
		title?: string;
		description?: string | null;
		video_url?: string | null;
		thumbnail_url?: string | null;
		community_id?: string | null;
	};
	if (!body.title?.trim()) return j({ error: 'title is required' }, 400);
	const d = db(platform);
	const row: AnimRow = {
		id: crypto.randomUUID(),
		title: body.title.trim(),
		description: body.description?.trim() || null,
		thumbnail_url: body.thumbnail_url || null,
		video_url: body.video_url || null,
		upvote_count: 0,
		comment_count: 0,
		created_at: new Date().toISOString(),
		author_id: locals.user.id,
		community_id: body.community_id || null
	};
	await put(d, row.id, { k: 'a', t: String(Date.parse(row.created_at)), u: row.author_id, c: row.community_id || '', j: JSON.stringify(row) });
	await cat_add(d, 'a', row.id);
	return j({ item: await hydrate(d, row) });
};
