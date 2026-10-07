import type { RequestHandler } from './$types';
import { get_list, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, locals, platform }) => {
	const r = await get_list(sql(platform), params.id, locals.user?.id);
	return r ? j(r) : j({ error: 'not found' }, 404);
};
