import type { RequestHandler } from './$types';
import { db, hydrate, one, parse, type AnimRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, platform }) => {
	const row = parse<AnimRow>(await one(db(platform), params.id));
	if (!row) return j({ error: 'not found' }, 404);
	return j({ item: await hydrate(db(platform), row) });
};
