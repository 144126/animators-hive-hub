import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get_anim, list_notes, sql } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const d = sql(platform);
	const a = await get_anim(d, params.animationId, locals.user?.id);
	if (!a) error(404, 'not found');
	// a: the animation, n: its comments
	return { a, n: await list_notes(d, a.id) };
};
