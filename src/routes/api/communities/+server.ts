import type { RequestHandler } from './$types';
import { fails, insert_comm, list_comms, sql } from '$lib/server/db';
import { j } from '$lib/server/session';
import { ok_comm_name } from '$lib/rules';

export const GET: RequestHandler = async ({ url, platform }) => {
	return j({
		items: await list_comms(sql(platform), (url.searchParams.get('q') || '').toLowerCase())
	});
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { name?: string };
	const display = body.name?.trim() || '';
	if (!ok_comm_name(display)) return j({ error: 'name invalid' }, 400);
	const slug = display
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
	if (!slug.replace(/-/g, '')) return j({ error: 'name needs letters or digits' }, 400);
	try {
		return j({ item: await insert_comm(sql(platform), locals.user.id, slug, display) });
	} catch (e) {
		if (fails(e, 'c.s')) return j({ error: 'community exists' }, 400);
		throw e;
	}
};
