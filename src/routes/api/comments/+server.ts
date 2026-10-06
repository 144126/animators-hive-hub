import type { RequestHandler } from './$types';
import {
	cat_add,
	cat_ids,
	db,
	many,
	one,
	parse,
	person,
	put,
	type AnimRow,
	type NoteRow,
	type UserRow
} from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, platform }) => {
	const post_id = url.searchParams.get('post_id') || '';
	const d = db(platform);
	const notes = (await many(d, await cat_ids(d, 'n')))
		.map((r) => parse<NoteRow>(r))
		.filter((x): x is NoteRow => !!x && x.post_id === post_id)
		.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
	const items = await Promise.all(
		notes.map(async (n) => ({
			id: n.id,
			content: n.content,
			created_at: n.created_at,
			author: person(parse<UserRow>(await one(d, n.author_id)))
		}))
	);
	return j({ items });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { post_id?: string; content?: string };
	if (!body.post_id || !body.content?.trim()) return j({ error: 'missing' }, 400);
	const d = db(platform);
	const row: NoteRow = {
		id: crypto.randomUUID(),
		content: body.content.trim(),
		created_at: new Date().toISOString(),
		author_id: locals.user.id,
		post_id: body.post_id
	};
	await put(d, row.id, { k: 'n', j: JSON.stringify(row) });
	await cat_add(d, 'n', row.id);
	const host = parse<AnimRow>(await one(d, body.post_id));
	if (host) {
		host.comment_count += 1;
		await put(d, host.id, { k: 'a', t: String(Date.parse(host.created_at)), u: host.author_id, c: host.community_id || '', j: JSON.stringify(host) });
	}
	return j({ item: { ...row, author: person(parse<UserRow>(await one(d, locals.user.id))) } });
};
