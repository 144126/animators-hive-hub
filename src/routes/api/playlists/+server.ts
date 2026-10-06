import type { RequestHandler } from './$types';
import { cat_add, cat_ids, db, many, parse, put, type ListRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const uid = url.searchParams.get('user_id') || locals.user?.id || '';
	if (!uid) return j({ items: [] });
	const rows = (await many(db(platform), await cat_ids(db(platform), 'l')))
		.map((r) => parse<ListRow>(r))
		.filter((x): x is ListRow => !!x && x.user_id === uid)
		.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
	return j({ items: rows });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { name?: string; description?: string };
	if (!body.name?.trim()) return j({ error: 'name required' }, 400);
	const row: ListRow = {
		id: crypto.randomUUID(),
		name: body.name.trim().slice(0, 100),
		description: body.description?.trim() || null,
		user_id: locals.user.id,
		created_at: new Date().toISOString()
	};
	const d = db(platform);
	await put(d, row.id, { k: 'l', u: row.user_id, j: JSON.stringify(row) }, platform);
	await cat_add(d, 'l', row.id, platform);
	return j({ item: row });
};
