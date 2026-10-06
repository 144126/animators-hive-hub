import type { RequestHandler } from './$types';
import { db, one, parse, type UserRow } from '$lib/server/db';
import { check, j, public_user, write_session } from '$lib/server/session';

export const POST: RequestHandler = async (e) => {
	const body = (await e.request.json()) as { email?: string; password?: string };
	const email = body.email?.trim().toLowerCase() || '';
	const d = db(e.platform);
	const ptr = parse<{ id: string }>(await one(d, `mail:${email}`));
	const u = ptr ? parse<UserRow>(await one(d, ptr.id)) : null;
	if (!u || !(await check(body.password || '', u.pass))) return j({ error: 'invalid email or password' }, 400);
	await write_session(e, u.id);
	return j({ user: public_user(u) });
};
