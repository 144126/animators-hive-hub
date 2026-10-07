import type { Handle } from '@sveltejs/kit';
import { sql, user_by_id } from '$lib/server/db';
import { read_session } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const id = await read_session(event);
	if (id && event.platform?.env?.DB) {
		const u = await user_by_id(sql(event.platform), id);
		if (u) event.locals.user = { id: u.id, email: u.email, username: u.username };
	}
	return resolve(event);
};
