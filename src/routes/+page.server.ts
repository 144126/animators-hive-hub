import type { PageServerLoad } from './$types';
import { list_anims, sql } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url, platform }) => {
	const s: 'new' | 'top' = url.searchParams.get('sort') === 'top' ? 'top' : 'new';
	if (!locals.user) return { a: [], s };
	// a: feed animations, s: sort
	return { a: await list_anims(sql(platform), { sort: s, viewer: locals.user.id }), s };
};
