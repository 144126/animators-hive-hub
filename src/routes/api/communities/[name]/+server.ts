import type { RequestHandler } from './$types';
import { comm_by_slug, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, platform }) => {
	const item = await comm_by_slug(sql(platform), params.name);
	return item ? j({ item }) : j({ error: 'not found' }, 404);
};
