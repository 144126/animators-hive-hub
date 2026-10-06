import type { RequestHandler } from './$types';
import { db, one, parse, type CommRow } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ params, platform }) => {
	const d = db(platform);
	const ptr = parse<{ id: string }>(await one(d, `cname:${params.name}`));
	const row = ptr ? parse<CommRow>(await one(d, ptr.id)) : null;
	if (!row) return j({ error: 'not found' }, 404);
	return j({ item: row });
};
