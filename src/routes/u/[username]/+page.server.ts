import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { list_anims, sql, user_by_username } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals, platform }) => {
	const d = sql(platform);
	const u = await user_by_username(d, params.username);
	if (!u) error(404, 'user not found');
	return {
		// p: public profile, never the email
		p: {
			id: u.id,
			username: u.username,
			display_name: u.display_name,
			avatar_url: u.avatar_url,
			bio: u.bio,
			location: u.location,
			website_url: u.website_url,
			created_at: u.created_at
		},
		// a: their latest animations
		a: await list_anims(d, { sort: 'new', author_id: u.id, viewer: locals.user?.id })
	};
};
