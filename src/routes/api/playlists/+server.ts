import type { RequestHandler } from './$types';
import { insert_list, list_lists, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const uid = url.searchParams.get('user_id') || locals.user?.id || '';
	return j({ items: uid ? await list_lists(sql(platform), uid) : [] });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { name?: string; description?: string };
	if (!body.name?.trim()) return j({ error: 'name required' }, 400);
	const item = await insert_list(
		sql(platform),
		locals.user.id,
		body.name.trim().slice(0, 100),
		body.description?.trim() || null
	);
	return j({ item });
};
