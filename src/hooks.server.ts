import type { Handle } from '@sveltejs/kit';
import { j, public_user, read_session } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	const u = await read_session(event);
	if (u) event.locals.user = public_user(u);
	const path = event.url.pathname;
	const write = event.request.method !== 'GET' && event.request.method !== 'HEAD';
	const auth = path.startsWith('/api/auth/') || path === '/login/google';
	const media = path === '/api/media';
	const rl = auth
		? event.platform?.env.RL_AUTH
		: media
			? event.platform?.env.RL_MEDIA
			: write && path.startsWith('/api/')
				? event.platform?.env.RL_WRITE
				: null;
	if (rl) {
		const ip = event.request.headers.get('cf-connecting-ip') || 'local';
		const key = auth ? ip : (event.locals.user?.id ?? ip);
		if (!(await rl.limit({ key })).success)
			return j({ error: 'too many requests, try again in a minute' }, 429);
	}
	return resolve(event);
};
