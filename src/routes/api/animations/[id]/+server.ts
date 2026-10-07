import type { RequestHandler } from './$types';
import { delete_anim, get_anim, sql, update_anim } from '$lib/server/db';
import { j, owned } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const item = await get_anim(sql(platform), params.id, locals.user?.id);
	return item ? j({ item }) : j({ error: 'not found' }, 404);
};

export const PATCH: RequestHandler = async ({ params, request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { title?: string; description?: string | null };
	if (!body.title?.trim()) return j({ error: 'title is required' }, 400);
	return owned(
		await update_anim(sql(platform), locals.user.id, params.id, {
			title: body.title.trim(),
			description: body.description?.trim() || null
		})
	);
};

export const DELETE: RequestHandler = async ({ params, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const { r, keys } = await delete_anim(sql(platform), locals.user.id, params.id);
	if (keys.length) await platform!.env.M.delete(keys);
	return owned(r);
};
