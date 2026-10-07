import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get_list, sql } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const r = await get_list(sql(platform), params.playlistId, locals.user?.id);
	if (!r) error(404, 'playlist not found');
	// l: the playlist, i: its items
	return { l: r.item, i: r.items };
};
