import type { RequestHandler } from './$types';
import { fails, insert_user, sql, type UserRow } from '$lib/server/db';
import { hash, j, public_user, write_session } from '$lib/server/session';
import { ok_email, ok_pass, ok_username } from '$lib/rules';

export const POST: RequestHandler = async (e) => {
	const body = (await e.request.json()) as { email?: string; password?: string; username?: string };
	const email = body.email?.trim().toLowerCase() || '';
	const username = body.username?.trim() || '';
	const password = body.password || '';
	if (!ok_email(email)) return j({ error: 'email invalid' }, 400);
	if (!ok_username(username)) return j({ error: 'username invalid' }, 400);
	if (!ok_pass(password)) return j({ error: 'password invalid' }, 400);
	const u: UserRow = {
		id: crypto.randomUUID(),
		email,
		username,
		display_name: username,
		bio: '',
		avatar_url: '',
		location: '',
		website_url: '',
		pass: await hash(password),
		created_at: new Date().toISOString()
	};
	try {
		await insert_user(sql(e.platform), u);
	} catch (x) {
		if (fails(x, 'u.n')) return j({ error: 'username is already taken' }, 400);
		if (fails(x, 'u.e')) return j({ error: 'email already used' }, 400);
		throw x;
	}
	await write_session(e, u.id);
	return j({ user: public_user(u) });
};
