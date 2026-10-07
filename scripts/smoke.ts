import { createHmac, randomBytes, randomUUID } from 'node:crypto';

const base = process.env.BASE || 'http://localhost:8080';

function fail(name: string, detail: unknown): never {
	console.error(`smoke failed: ${name}`, detail);
	process.exit(1);
}

async function call(
	path: string,
	o: {
		method?: string;
		body?: unknown;
		cookie?: string;
		raw?: Blob;
		headers?: Record<string, string>;
	} = {}
) {
	const headers: Record<string, string> = { ...o.headers };
	if (o.cookie) headers.cookie = o.cookie;
	if (o.body !== undefined) headers['content-type'] = 'application/json';
	const r = await fetch(base + path, {
		method: o.method || (o.body !== undefined || o.raw ? 'POST' : 'GET'),
		headers,
		redirect: 'manual',
		body: o.raw ?? (o.body !== undefined ? JSON.stringify(o.body) : undefined)
	});
	return r;
}

async function json(r: Response) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the smoke test pokes loose json on purpose
	return (await r.json().catch(() => ({}))) as Record<string, any>;
}

async function signup(name: string) {
	const r = await call('/api/auth/signup', {
		body: { email: `${name}@example.com`, password: 'smoke-pass-1', username: name }
	});
	const d = await json(r);
	if (r.status !== 200) fail('sign up', d);
	const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
	if (!cookie) fail('sign up cookie', r.headers);
	return { id: d.user.id as string, cookie };
}

const gstart = await call('/login/google');
if (gstart.status !== 302) fail('google start status', gstart.status);
const gloc = gstart.headers.get('location') || '';
if (!gloc.includes('accounts.google.com') || !gloc.includes('redirect_uri='))
	fail('google start location', gloc);
const gcb = await call('/google');
if (gcb.status !== 400) fail('google callback without code', gcb.status);

const name = () => 'smk' + randomBytes(4).toString('hex');
const an = name();
const a = await signup(an);
const me = await json(await call('/api/me', { cookie: a.cookie }));
if (me.user?.id !== a.id) fail('me right after sign up', me);
const home = await (await call('/', { cookie: a.cookie })).text();
if (!home.includes('discover') || home.includes('sign up now'))
	fail('ssr signed-in home', home.length);
const dup = await call('/api/auth/signup', {
	body: { email: `x${an}@example.com`, password: 'smoke-pass-1', username: an.toUpperCase() }
});
if (dup.status !== 400) fail('duplicate username any case', dup.status);
const a2 = await call('/api/auth/signin', {
	body: { email: `${an}@example.com`, password: 'smoke-pass-1' }
});
const a2c = (a2.headers.get('set-cookie') || '').split(';')[0];
if (!a2c || (await json(await call('/api/me', { cookie: a2c }))).user?.id !== a.id)
	fail('second sign in', a2.status);
const pw = await call('/api/auth/password', {
	cookie: a.cookie,
	body: { o: 'smoke-pass-1', n: 'smoke-pass-2' }
});
if (pw.status !== 200) fail('change password', await json(pw));
if ((await json(await call('/api/me', { cookie: a2c }))).user !== null)
	fail('other session ended', a2c);
if ((await json(await call('/api/me', { cookie: a.cookie }))).user?.id !== a.id)
	fail('current session kept', a.cookie);
const old_in = await call('/api/auth/signin', {
	body: { email: `${an}@example.com`, password: 'smoke-pass-1' }
});
if (old_in.status !== 400) fail('old password rejected', old_in.status);
const new_in = await call('/api/auth/signin', {
	body: { email: `${an}@example.com`, password: 'smoke-pass-2' }
});
if (new_in.status !== 200) fail('new password signs in', new_in.status);
const b = await signup(name());
const pub = await call(`/u/${an}`);
if (pub.status !== 200 || !(await pub.text()).includes(an)) fail('public profile', pub.status);
if ((await call('/u/nobody_here_9')).status !== 404) fail('missing profile 404', 'nobody_here_9');

const up = async (type: string) => {
	const r = await call('/api/media', {
		raw: new Blob([randomBytes(1024)], { type }),
		cookie: a.cookie,
		headers: { 'content-type': type }
	});
	const d = await json(r);
	if (r.status !== 200 || !d.u) fail(`upload ${type}`, d);
	return d.u as string;
};
const video = await up('video/mp4');
const image = await up('image/jpeg');
const prof = (av: string) =>
	call('/api/profile', { cookie: a.cookie, body: { display_name: an, avatar_url: av } });
const pr = await prof(image);
if (pr.status !== 200 || (await json(pr)).user?.user_metadata?.avatar_url !== image)
	fail('avatar set', pr.status);
if ((await prof('javascript:x')).status !== 400) fail('bad avatar rejected', 'javascript:x');
const part = await call(video, { headers: { range: 'bytes=0-9' } });
if (part.status !== 206 || (await part.arrayBuffer()).byteLength !== 10)
	fail('range 206', part.status);

const create = async () => {
	const r = await call('/api/animations', {
		cookie: a.cookie,
		body: { title: 'smoke', video_url: video, thumbnail_url: image }
	});
	const d = await json(r);
	if (r.status !== 200) fail('create animation', d);
	return d.item.id as string;
};
const anim = await create();
const mine = async () =>
	(await json(await call(`/api/animations?author_id=${a.id}`))).items as {
		id: string;
		upvote_count: number;
	}[];
if (!(await mine()).some((x) => x.id === anim)) fail('animation listed at once', anim);
await Promise.all([create(), create(), create(), create(), create()]);
if ((await mine()).length !== 6) fail('parallel creates all listed', (await mine()).length);
const paged = (await json(await call(`/api/animations?author_id=${a.id}&offset=5`))).items;
if (paged.length !== 1) fail('offset paging', paged.length);

const vote = async (on: boolean) => {
	const r = await call('/api/upvotes', { cookie: a.cookie, body: { target: anim, on } });
	if (r.status !== 200) fail('vote', await json(r));
	return (await json(await call(`/api/animations/${anim}`))).item.upvote_count;
};
if ((await vote(true)) !== 1) fail('vote on count', 1);
if (!(await json(await call(`/api/upvotes?target=${anim}`, { cookie: a.cookie }))).voted)
	fail('voted true', anim);
if ((await vote(false)) !== 0) fail('vote off count', 0);

const c = await call('/api/comments', { cookie: a.cookie, body: { post_id: anim, content: 'hi' } });
const cid = (await json(c)).item?.id as string;
if (c.status !== 200 || !cid) fail('comment', cid);
if (!(await json(await call(`/api/comments?post_id=${anim}`))).items.length)
	fail('comment listed at once', anim);
const cdel = (cookie: string) => call(`/api/comments?id=${cid}`, { method: 'DELETE', cookie });
if ((await cdel(b.cookie)).status !== 403) fail('other user deletes comment 403', cid);
if ((await cdel(a.cookie)).status !== 200) fail('author deletes comment', cid);
if ((await json(await call(`/api/animations/${anim}`))).item.comment_count !== 0)
	fail('comment count after delete', anim);
const orphan = await call('/api/comments', {
	cookie: a.cookie,
	body: { post_id: randomUUID(), content: 'x' }
});
if (orphan.status !== 404) fail('comment on missing animation', orphan.status);

const list = (
	await json(await call('/api/playlists', { cookie: a.cookie, body: { name: 'smoke' } }))
).item.id as string;
const item = (cookie: string) =>
	call('/api/playlist-items', { cookie, body: { playlist_id: list, animation_id: anim } });
if ((await item(a.cookie)).status !== 200) fail('playlist item', list);
if ((await item(a.cookie)).status !== 400) fail('duplicate playlist item', list);
if ((await item(b.cookie)).status !== 403) fail('other user adds to playlist', list);
const lpatch = (cookie: string, name: string) =>
	call(`/api/playlists/${list}`, { method: 'PATCH', cookie, body: { name } });
if ((await lpatch(b.cookie, 'x')).status !== 403) fail('other user rename playlist 403', list);
const iid = (await json(await call(`/api/playlists/${list}`))).items?.[0]?.id as string;
if (!iid) fail('playlist item id', list);
if (
	(await call(`/api/playlist-items?id=${iid}`, { method: 'DELETE', cookie: a.cookie })).status !==
	200
)
	fail('owner removes item', iid);
if ((await json(await call(`/api/playlists/${list}`))).items?.length !== 0)
	fail('playlist empty after remove', list);
if ((await call(`/api/playlists/${list}`, { method: 'DELETE', cookie: a.cookie })).status !== 200)
	fail('owner deletes playlist', list);
if ((await call(`/api/playlists/${list}`)).status !== 404) fail('deleted playlist is 404', list);

const cn = name();
const cr = await call('/api/communities', { cookie: a.cookie, body: { name: cn } });
if (cr.status !== 200) fail('community create', await json(cr));
if (
	!(await json(await call('/api/communities'))).items.some((x: { name: string }) => x.name === cn)
)
	fail('community listed', cn);
const join = (cookie: string, o: boolean) =>
	call(`/api/communities/${cn}/join`, { cookie, body: { o } });
if ((await join(b.cookie, true)).status !== 200) fail('join community', cn);
if ((await json(await call(`/api/communities/${cn}`))).item.member_count !== 2)
	fail('member count after join', cn);
if ((await join(b.cookie, false)).status !== 200) fail('leave community', cn);
if ((await json(await call(`/api/communities/${cn}`))).item.member_count !== 1)
	fail('member count after leave', cn);

const vid2 = await up('video/mp4');
const del = (
	await json(
		await call('/api/animations', {
			cookie: a.cookie,
			body: { title: 'to delete', video_url: vid2 }
		})
	)
).item.id as string;
const patch = (cookie: string, title: string) =>
	call(`/api/animations/${del}`, { method: 'PATCH', cookie, body: { title } });
if ((await patch(b.cookie, 'x')).status !== 403) fail('other user edit 403', del);
if ((await call(`/api/animations/${del}`, { method: 'DELETE', cookie: b.cookie })).status !== 403)
	fail('other user delete 403', del);
if ((await patch(a.cookie, 'renamed')).status !== 200) fail('owner edit', del);
if ((await json(await call(`/api/animations/${del}`))).item?.title !== 'renamed')
	fail('edit shows', del);
if ((await call(`/api/animations/${del}`, { method: 'DELETE', cookie: a.cookie })).status !== 200)
	fail('owner delete', del);
if ((await call(`/api/animations/${del}`)).status !== 404) fail('deleted is 404', del);
if ((await call(vid2)).status !== 404) fail('deleted media gone', vid2);
const msg = `${a.id}.99999999999999`;
const mac = createHmac('sha256', 'ahh-session-9f3c2e1a7b84d056').update(msg).digest('base64');
const forged = await json(
	await call('/api/me', { cookie: `ahh=${encodeURIComponent(`${msg}.${mac}`)}` })
);
if (forged.user !== null) fail('forged cookie rejected', forged);
const bn = (await json(await call('/api/me', { cookie: b.cookie }))).user?.user_metadata
	?.username as string;
if (!bn) fail('b username', b.id);
if (
	(await call('/api/me', { method: 'DELETE', cookie: b.cookie, body: { n: 'nope' } })).status !==
	400
)
	fail('delete account mismatch', bn);
if ((await call('/api/me', { method: 'DELETE', cookie: b.cookie, body: { n: bn } })).status !== 200)
	fail('delete account', bn);
if ((await json(await call('/api/me', { cookie: b.cookie }))).user !== null)
	fail('deleted cookie dead', bn);
if (
	(
		await call('/api/auth/signin', {
			body: { email: `${bn}@example.com`, password: 'smoke-pass-1' }
		})
	).status !== 400
)
	fail('deleted sign in fails', bn);
if ((await call('/api/auth/signout', { method: 'POST', cookie: a.cookie })).status !== 200)
	fail('sign out', a.cookie);
if ((await json(await call('/api/me', { cookie: a.cookie }))).user !== null)
	fail('sign out kills session', a.cookie);

console.log(`smoke ok ${an} ${video.split('/').pop()} ${image.split('/').pop()}`);
