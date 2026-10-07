import type { RequestHandler } from './$types';
import { delete_list, get_list, sql, update_list } from '$lib/server/db';
import { j, owned } from '$lib/server/session';
import { ok_list_desc, ok_list_name } from '$lib/rules';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const r = await get_list(sql(platform), params.id, locals.user?.id);
	return r ? j(r) : j({ error: 'not found' }, 404);
};

export const PATCH: RequestHandler = async ({ params, request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { name?: string; description?: string | null };
	const name = body.name?.trim() || '';
	const description = body.description?.trim() || '';
	if (!ok_list_name(name)) return j({ error: 'name invalid' }, 400);
	if (!ok_list_desc(description)) return j({ error: 'description invalid' }, 400);
	return owned(
		await update_list(sql(platform), locals.user.id, params.id, {
			name,
			description: description || null
		})
	);
};

export const DELETE: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	return owned(await delete_list(sql(platform), locals.user.id, params.id));
};
