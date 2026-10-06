import type { RequestHandler } from './$types';
import { db, one, parse, type UserRow } from '$lib/server/db';
import { j, public_user } from '$lib/server/session';

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return j({ user: null });
	const u = parse<UserRow>(await one(db(platform), locals.user.id));
	return j({ user: u ? public_user(u) : null });
};
