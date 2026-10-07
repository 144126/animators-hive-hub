import type { RequestHandler } from './$types';
import { fails, insert_note, list_notes, sql, user_by_id, person } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, platform }) => {
	return j({ items: await list_notes(sql(platform), url.searchParams.get('post_id') || '') });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { post_id?: string; content?: string };
	if (!body.post_id || !body.content?.trim()) return j({ error: 'missing' }, 400);
	const d = sql(platform);
	try {
		const row = await insert_note(d, locals.user.id, body.post_id, body.content.trim());
		return j({ item: { ...row, author: person(await user_by_id(d, locals.user.id)) } });
	} catch (e) {
		if (fails(e, 'FOREIGN KEY')) return j({ error: 'not found' }, 404);
		throw e;
	}
};
