import type { RequestHandler } from './$types';
import { fails, insert_anim, list_anims, sql } from '$lib/server/db';
import { j } from '$lib/server/session';

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const items = await list_anims(sql(platform), {
		sort: url.searchParams.get('sort') === 'top' ? 'top' : 'new',
		community_id: url.searchParams.get('community_id') || undefined,
		author_id: url.searchParams.get('author_id') || undefined,
		viewer: locals.user?.id
	});
	return j({ items });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as {
		title?: string;
		description?: string | null;
		video_url?: string | null;
		thumbnail_url?: string | null;
		community_id?: string | null;
	};
	if (!body.title?.trim()) return j({ error: 'title is required' }, 400);
	const media = /^\/media\/[0-9a-f-]{36}$/;
	if (!media.test(body.video_url || '') || (body.thumbnail_url && !media.test(body.thumbnail_url)))
		return j({ error: 'upload the video first' }, 400);
	try {
		const item = await insert_anim(sql(platform), {
			author_id: locals.user.id,
			community_id: body.community_id || null,
			title: body.title.trim(),
			description: body.description?.trim() || null,
			video_url: body.video_url || null,
			thumbnail_url: body.thumbnail_url || null
		});
		return j({ item });
	} catch (e) {
		if (fails(e, 'FOREIGN KEY')) return j({ error: 'not found' }, 404);
		throw e;
	}
};
