import type { RequestHandler } from './$types';
import { db, one, parse, put, type UserRow } from '$lib/server/db';
import { hash, j, public_user, write_session } from '$lib/server/session';

export const POST: RequestHandler = async (e) => {
	const body = (await e.request.json()) as { email?: string; password?: string; username?: string };
	const email = body.email?.trim().toLowerCase() || '';
	const username = body.username?.trim() || '';
	const password = body.password || '';
	if (!email || !username || password.length < 6) return j({ error: 'invalid fields' }, 400);
	const d = db(e.platform);
	if (parse<UserRow>(await one(d, `name:${username}`))) return j({ error: 'username is already taken' }, 400);
	if (parse<UserRow>(await one(d, `mail:${email}`))) return j({ error: 'email already used' }, 400);
	const id = crypto.randomUUID();
	const u: UserRow = {
		id,
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
	await put(d, id, { k: 'u', n: username, j: JSON.stringify(u) });
	await put(d, `name:${username}`, { k: 'u', j: JSON.stringify({ id }) });
	await put(d, `mail:${email}`, { k: 'u', j: JSON.stringify({ id }) });
	await write_session(e, id);
	return j({ user: public_user(u) });
};
