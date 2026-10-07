import type { RequestHandler } from './$types';
import { delete_user, sql, user_by_id } from '$lib/server/db';
import { clear_session, j, public_user } from '$lib/server/session';

export const GET: RequestHandler = async ({ locals, platform }) => {
	if (!locals.user) return j({ user: null });
	const u = await user_by_id(sql(platform), locals.user.id);
	return j({ user: u ? public_user(u) : null });
};

export const DELETE: RequestHandler = async (e) => {
	if (!e.locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await e.request.json()) as { n?: string }; // n: username typed to confirm
	const name = e.locals.user.user_metadata.username;
	if ((body.n || '') !== name) return j({ error: 'username mismatch' }, 400);
	const keys = await delete_user(sql(e.platform), e.locals.user.id);
	if (keys.length) await e.platform!.env.M.delete(keys);
	await clear_session(e);
	return j({ ok: true });
};
