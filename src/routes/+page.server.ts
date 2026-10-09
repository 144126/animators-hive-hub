import type { PageServerLoad } from './$types';
import { list_anims, sql } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url, platform }) => {
	const s: 'new' | 'top' = url.searchParams.get('sort') === 'top' ? 'top' : 'new';
	const q = url.searchParams.get('q')?.trim() || '';
	if (!locals.user) return { a: [], s, q };
	// a: feed animations, s: sort, q: title/description search
	return {
		a: await list_anims(sql(platform), { sort: s, viewer: locals.user.id, q: q || undefined }),
		s,
		q
	};
};
