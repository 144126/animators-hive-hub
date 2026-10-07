import type { RequestHandler } from './$types';
import { delete_other_sessions, set_pass, sql, user_by_id } from '$lib/server/db';
import { check, hash, j, token_id } from '$lib/server/session';
import { ok_pass } from '$lib/rules';

export const POST: RequestHandler = async (e) => {
	if (!e.locals.user) return j({ error: 'sign in required' }, 401);
	const body = (await e.request.json()) as { o?: string; n?: string }; // o: old password, n: new
	const n = body.n || '';
	if (!ok_pass(n)) return j({ error: 'password invalid' }, 400);
	const u = await user_by_id(sql(e.platform), e.locals.user.id);
	if (!u) return j({ error: 'not found' }, 404);
	if (u.pass && !(await check(body.o || '', u.pass))) return j({ error: 'wrong password' }, 400);
	await set_pass(sql(e.platform), u.id, await hash(n));
	const tok = e.cookies.get('ahh');
	if (tok) await delete_other_sessions(sql(e.platform), u.id, await token_id(tok));
	return j({ ok: true });
};
