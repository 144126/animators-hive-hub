import type { RequestHandler } from './$types';
import { sql, user_by_id } from '$lib/server/db';
import { j, public_user } from '$lib/server/session';

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return j({ user: null });
	const u = await user_by_id(sql(platform), locals.user.id);
	return j({ user: u ? public_user(u) : null });
};
