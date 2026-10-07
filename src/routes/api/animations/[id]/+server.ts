import type { RequestHandler } from './$types';
import { get_anim, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const item = await get_anim(sql(platform), params.id, locals.user?.id);
	return item ? j({ item }) : j({ error: 'not found' }, 404);
};
