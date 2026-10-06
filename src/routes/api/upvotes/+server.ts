import type { RequestHandler } from './$types';
import { db, one, parse, put, type AnimRow } from '$lib/server/db';
import { j } from '$lib/server/session';

function vid(user_id: string, target: string) {
	return `v:${user_id}:${target}`;
}

export const GET: RequestHandler = async ({ url, locals, platform }) => {
	const target = url.searchParams.get('target') || '';
	if (!locals.user || !target) return j({ voted: false });
	return j({ voted: !!(await one(db(platform), vid(locals.user.id, target))) });
};

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await request.json()) as { target?: string; on?: boolean };
	if (!body.target) return j({ error: 'missing' }, 400);
	const d = db(platform);
	const id = vid(locals.user.id, body.target);
	const host = parse<AnimRow>(await one(d, body.target));
	const has = !!(await one(d, id));
	if (body.on && !has) {
		await put(d, id, { k: 'v', u: locals.user.id, j: '1' }, platform);
		if (host) {
			host.upvote_count += 1;
			await put(d, host.id, { k: 'a', t: String(Date.parse(host.created_at)), u: host.author_id, c: host.community_id || '', j: JSON.stringify(host) }, platform);
		}
	} else if (!body.on && has) {
		await d.deleteByIds([id]);
		if (host) {
			host.upvote_count = Math.max(0, host.upvote_count - 1);
			await put(d, host.id, { k: 'a', t: String(Date.parse(host.created_at)), u: host.author_id, c: host.community_id || '', j: JSON.stringify(host) }, platform);
		}
	}
	return j({ ok: true });
};
