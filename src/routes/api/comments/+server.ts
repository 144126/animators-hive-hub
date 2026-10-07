import type { RequestHandler } from './$types';
import {
	delete_note,
	fails,
	insert_note,
	list_notes,
	sql,
	user_by_id,
	person
} from '$lib/server/db';
import { j, owned } from '$lib/server/session';
import { ok_comment } from '$lib/rules';

export const GET: RequestHandler = async ({ url, platform }) => {
	return j({ items: await list_notes(sql(platform), url.searchParams.get('post_id') || '') });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { post_id?: string; content?: string };
	const content = body.content?.trim() || '';
	if (!body.post_id || !ok_comment(content)) return j({ error: 'comment invalid' }, 400);
	const d = sql(platform);
	try {
		const row = await insert_note(d, locals.user.id, body.post_id, content);
		return j({ item: { ...row, author: person(await user_by_id(d, locals.user.id)) } });
	} catch (e) {
		if (fails(e, 'FOREIGN KEY')) return j({ error: 'not found' }, 404);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ url, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	return owned(await delete_note(sql(platform), locals.user.id, url.searchParams.get('id') || ''));
};
