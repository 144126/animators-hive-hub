import type { RequestHandler } from './$types';
import { sql, user_by_email } from '$lib/server/db';
import { check, j, public_user, write_session } from '$lib/server/session';

export const POST: RequestHandler = async (e) => {
	const body = (await e.request.json()) as { email?: string; password?: string };
	const u = await user_by_email(sql(e.platform), body.email?.trim().toLowerCase() || '');
	if (!u) return j({ error: 'invalid email or password' }, 400);
	if (!u.pass) return j({ error: 'try signing in with google' }, 400);
	if (!(await check(body.password || '', u.pass)))
		return j({ error: 'invalid email or password' }, 400);
	await write_session(e, u.id);
	return j({ user: public_user(u) });
};
