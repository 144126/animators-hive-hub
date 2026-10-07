import type { RequestHandler } from './$types';
import { insert_list, list_lists, sql } from '$lib/server/db';
import { j } from '$lib/server/session';
import { ok_list_desc, ok_list_name } from '$lib/rules';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const uid = url.searchParams.get('user_id') || locals.user?.id || '';
	return j({ items: uid ? await list_lists(sql(platform), uid) : [] });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { name?: string; description?: string };
	const name = body.name?.trim() || '';
	const description = body.description?.trim() || '';
	if (!ok_list_name(name)) return j({ error: 'name invalid' }, 400);
	if (!ok_list_desc(description)) return j({ error: 'description invalid' }, 400);
	const item = await insert_list(sql(platform), locals.user.id, name, description || null);
	return j({ item });
};
