import type { RequestHandler } from './$types';
import { delete_anim, get_anim, sql, update_anim } from '$lib/server/db';
import { j, owned } from '$lib/server/session';
import { ok_desc, ok_title } from '$lib/rules';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const item = await get_anim(sql(platform), params.id, locals.user?.id);
	return item ? j({ item }) : j({ error: 'not found' }, 404);
};

export const PATCH: RequestHandler = async ({ params, request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { title?: string; description?: string | null };
	const title = body.title?.trim() || '';
	const description = body.description?.trim() || '';
	if (!ok_title(title)) return j({ error: 'title invalid' }, 400);
	if (!ok_desc(description)) return j({ error: 'description invalid' }, 400);
	return owned(
		await update_anim(sql(platform), locals.user.id, params.id, {
			title,
			description: description || null
		})
	);
};

export const DELETE: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const { r, keys } = await delete_anim(sql(platform), locals.user.id, params.id);
	if (keys.length) await platform!.env.M.delete(keys);
	return owned(r);
};
