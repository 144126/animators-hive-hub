import type { Handle } from '@sveltejs/kit';
import { public_user, read_session } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const u = await read_session(event);
	if (u) event.locals.user = public_user(u);
	return resolve(event);
};
