import type { RequestHandler } from './$types';
import { db, one, parse, put, type UserRow } from '$lib/server/db';
import { j, public_user } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as {
		display_name?: string;
		bio?: string;
		location?: string;
		website_url?: string;
	};
	const d = db(platform);
	const u = parse<UserRow>(await one(d, locals.user.id));
	if (!u) return j({ error: 'no user' }, 404);
	u.display_name = (body.display_name || u.display_name).slice(0, 50);
	u.bio = (body.bio || '').slice(0, 500);
	u.location = (body.location || '').slice(0, 100);
	u.website_url = body.website_url || '';
	await put(d, u.id, { k: 'u', n: u.username, j: JSON.stringify(u) });
	return j({ user: public_user(u) });
};
