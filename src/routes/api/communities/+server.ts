import type { RequestHandler } from './$types';
import { cat_add, cat_ids, db, many, one, parse, put, type CommRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, platform }) => {
	const q = (url.searchParams.get('q') || '').toLowerCase();
	const rows = (await many(db(platform), await cat_ids(db(platform), 'c')))
		.map((r) => parse<CommRow>(r))
		.filter((x): x is CommRow => !!x)
		.filter((c) => !q || c.display_name.toLowerCase().includes(q) || c.name.includes(q))
		.sort((a, b) => a.display_name.localeCompare(b.display_name));
	return j({ items: rows });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { name?: string };
	const display = body.name?.trim() || '';
	if (!display) return j({ error: 'name required' }, 400);
	const slug = display.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	const d = db(platform);
	const ptr = parse<{ id: string }>(await one(d, `cname:${slug}`));
	if (ptr) return j({ error: 'community exists' }, 400);
	const row: CommRow = {
		id: crypto.randomUUID(),
		name: slug,
		display_name: display,
		description: null,
		avatar_url: null,
		banner_url: null,
		member_count: 1,
		creator_id: locals.user.id
	};
	await put(d, row.id, { k: 'c', n: slug, j: JSON.stringify(row) });
	await put(d, `cname:${slug}`, { k: 'c', j: JSON.stringify({ id: row.id }) });
	await cat_add(d, 'c', row.id);
	return j({ item: row });
};
