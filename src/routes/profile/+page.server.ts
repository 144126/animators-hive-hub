import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { list_anims, list_lists, sql } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) redirect(303, '/');
	const d = sql(platform);
	const id = locals.user.id;
	// a: my animations, l: my playlists
	return {
		a: await list_anims(d, { sort: 'new', author_id: id, viewer: id }),
		l: await list_lists(d, id)
	};
};
