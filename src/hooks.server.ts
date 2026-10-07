import type { Handle } from '@sveltejs/kit';
import { db, one, parse, type UserRow } from '$lib/server/db';
import { read_session } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const id = await read_session(event);
	if (id && event.platform?.env?.V) {
		const u = parse<UserRow>(await one(db(event.platform), id));
		if (u) event.locals.user = { id: u.id, email: u.email, username: u.username };
	}
	return resolve(event);
};
