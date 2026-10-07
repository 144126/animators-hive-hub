import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { comm_by_slug, list_anims, sql } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, url, platform }) => {
	const d = sql(platform);
	const c = await comm_by_slug(d, params.communityName);
	if (!c) error(404, 'community not found');
	const s: 'new' | 'top' = url.searchParams.get('sort') === 'top' ? 'top' : 'new';
	// c: community, a: its animations, s: sort
	return { c, a: await list_anims(d, { sort: s, community_id: c.id, viewer: locals.user?.id }), s };
};
