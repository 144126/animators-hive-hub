import type { RequestHandler } from './$types';
import { save_profile, sql, user_by_id } from '$lib/server/db';
import { j, public_user } from '$lib/server/session';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as {
		display_name?: string;
		bio?: string;
		location?: string;
		website_url?: string;
		avatar_url?: string;
	};
	const avatar = body.avatar_url ?? '';
	if (
		avatar &&
		!/^\/media\/[0-9a-f-]{36}$/.test(avatar) &&
		!avatar.startsWith('https://lh3.googleusercontent.com/')
	)
		return j({ error: 'avatar must be an uploaded image' }, 400);
	const d = sql(platform);
	const u = await user_by_id(d, locals.user.id);
	if (!u) return j({ error: 'no user' }, 404);
	const n = await save_profile(d, u.id, {
		display_name: (body.display_name || u.display_name).slice(0, 50),
		bio: (body.bio || '').slice(0, 500),
		location: (body.location || '').slice(0, 100),
		website_url: body.website_url || '',
		avatar_url: body.avatar_url === undefined ? u.avatar_url : avatar
	});
	return j({ user: n ? public_user(n) : null });
};
