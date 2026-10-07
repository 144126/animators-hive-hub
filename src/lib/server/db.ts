import { error } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';

export type UserRow = {
	id: string;
	email: string;
	username: string;
	display_name: string;
	bio: string;
	avatar_url: string;
	location: string;
	website_url: string;
	pass: string;
	created_at: string;
};

export type CommRow = {
	id: string;
	name: string;
	display_name: string;
	description: string | null;
	avatar_url: string | null;
	banner_url: string | null;
	member_count: number;
	creator_id: string;
	j?: boolean; // j: viewer joined
};

export type ListRow = {
	id: string;
	name: string;
	description: string | null;
	user_id: string;
	created_at: string;
};

export function person(u: UserRow | null): {
	username: string;
	avatar_url: string | null;
	display_name: string | null;
} {
	return {
		username: u?.username || 'user',
		avatar_url: u?.avatar_url || null,
		display_name: u?.display_name || u?.username || null
	};
}

export function sql(p?: App.Platform): D1Database {
	const d = p?.env?.DB;
	if (!d) throw error(500, 'no d1');
	return d;
}

export const fails = (e: unknown, what: string) => String(e).includes(what);

const iso = (t: number) => new Date(t).toISOString();

type UserDb = Omit<UserRow, 'created_at'> & { t: number };

const user_sel =
	'select i as id, e as email, n as username, d as display_name, b as bio, a as avatar_url, l as location, w as website_url, p as pass, t from u';

function to_user(r: UserDb | null): UserRow | null {
	if (!r) return null;
	const { t, ...x } = r;
	return { ...x, created_at: iso(t) };
}

export async function insert_user(d: D1Database, u: UserRow) {
	await d
		.prepare('insert into u (i, e, n, d, a, p, t) values (?, ?, ?, ?, ?, ?, ?)')
		.bind(u.id, u.email, u.username, u.display_name, u.avatar_url, u.pass, Date.parse(u.created_at))
		.run();
}

export async function find_or_create_google(
	d: D1Database,
	g: { email: string; name: string; picture: string }
) {
	const email = g.email.trim().toLowerCase();
	const existing = await user_by_email(d, email);
	if (existing) {
		if (g.picture && existing.avatar_url !== g.picture) {
			await d.prepare('update u set a = ? where i = ?').bind(g.picture, existing.id).run();
			existing.avatar_url = g.picture;
		}
		return existing;
	}
	const base = (email.split('@')[0] || 'user').replace(/[^a-z0-9_]/gi, '').slice(0, 24) || 'user';
	for (let i = 0; i < 8; i++) {
		const username = i === 0 ? base : `${base.slice(0, 20)}${crypto.randomUUID().slice(0, 8)}`;
		const u: UserRow = {
			id: crypto.randomUUID(),
			email,
			username,
			display_name: (g.name || username).slice(0, 50),
			bio: '',
			avatar_url: g.picture,
			location: '',
			website_url: '',
			pass: '',
			created_at: new Date().toISOString()
		};
		try {
			await insert_user(d, u);
			return u;
		} catch (e) {
			if (fails(e, 'u.e')) {
				const again = await user_by_email(d, email);
				if (again) return again;
			}
			if (fails(e, 'u.n')) continue;
			throw e;
		}
	}
	throw error(500, 'username');
}

export async function user_by_id(d: D1Database, id: string) {
	return to_user(await d.prepare(`${user_sel} where i = ?`).bind(id).first<UserDb>());
}

export async function user_by_email(d: D1Database, email: string) {
	return to_user(await d.prepare(`${user_sel} where e = ?`).bind(email).first<UserDb>());
}

export async function user_by_username(d: D1Database, n: string) {
	return to_user(await d.prepare(`${user_sel} where n = ?`).bind(n).first<UserDb>());
}

export async function save_profile(
	d: D1Database,
	id: string,
	v: {
		display_name: string;
		bio: string;
		location: string;
		website_url: string;
		avatar_url: string;
	}
) {
	await d
		.prepare('update u set d = ?, b = ?, l = ?, w = ?, a = ? where i = ?')
		.bind(v.display_name, v.bio, v.location, v.website_url, v.avatar_url, id)
		.run();
	return user_by_id(d, id);
}

type AnimDb = {
	id: string;
	title: string;
	description: string | null;
	thumbnail_url: string | null;
	video_url: string | null;
	upvote_count: number;
	comment_count: number;
	t: number;
	author_id: string;
	community_id: string | null;
	author_username: string;
	author_avatar: string;
	author_display: string;
	community_name: string | null;
	community_display: string | null;
	voted: number;
};

const anim_sel = `select a.i as id, a.ti as title, a.d as description, a.im as thumbnail_url, a.v as video_url,
	a.p as upvote_count, a.n as comment_count, a.t, a.u as author_id, a.c as community_id,
	u.n as author_username, u.a as author_avatar, u.d as author_display, c.s as community_name, c.n as community_display,
	exists(select 1 from v where v.a = a.i and v.u = ?) as voted
	from a join u on u.i = a.u left join c on c.i = a.c`;

function to_anim(r: AnimDb) {
	return {
		id: r.id,
		title: r.title,
		description: r.description,
		thumbnail_url: r.thumbnail_url,
		video_url: r.video_url,
		upvote_count: r.upvote_count,
		comment_count: r.comment_count,
		created_at: iso(r.t),
		author_id: r.author_id,
		community_id: r.community_id,
		author: {
			username: r.author_username,
			avatar_url: r.author_avatar || null,
			display_name: r.author_display || r.author_username
		},
		community: r.community_name
			? { name: r.community_name, display_name: r.community_display || r.community_name }
			: null,
		voted: !!r.voted
	};
}

export async function list_anims(
	d: D1Database,
	o: {
		sort: 'new' | 'top';
		community_id?: string;
		author_id?: string;
		viewer?: string;
		offset?: number;
	}
) {
	const w: string[] = [];
	const b: string[] = [o.viewer || ''];
	if (o.community_id) {
		w.push('a.c = ?');
		b.push(o.community_id);
	}
	if (o.author_id) {
		w.push('a.u = ?');
		b.push(o.author_id);
	}
	const q = `${anim_sel}${w.length ? ` where ${w.join(' and ')}` : ''} order by ${o.sort === 'top' ? 'a.p desc, ' : ''}a.t desc limit 20 offset ${Math.min(Math.max(0, Math.floor(o.offset || 0)), 2000)}`;
	const { results } = await d
		.prepare(q)
		.bind(...b)
		.all<AnimDb>();
	return results.map(to_anim);
}

export async function get_anim(d: D1Database, id: string, viewer = '') {
	const r = await d.prepare(`${anim_sel} where a.i = ?`).bind(viewer, id).first<AnimDb>();
	return r ? to_anim(r) : null;
}

export async function insert_anim(
	d: D1Database,
	x: {
		author_id: string;
		community_id: string | null;
		title: string;
		description: string | null;
		video_url: string | null;
		thumbnail_url: string | null;
	}
) {
	const id = crypto.randomUUID();
	await d
		.prepare('insert into a (i, u, c, ti, d, v, im, t) values (?, ?, ?, ?, ?, ?, ?, ?)')
		.bind(
			id,
			x.author_id,
			x.community_id,
			x.title,
			x.description,
			x.video_url,
			x.thumbnail_url,
			Date.now()
		)
		.run();
	return get_anim(d, id, x.author_id);
}

export async function set_vote(d: D1Database, user_id: string, anim_id: string, on: boolean) {
	await d.batch([
		on
			? d
					.prepare('insert or ignore into v (u, a, t) values (?, ?, ?)')
					.bind(user_id, anim_id, Date.now())
			: d.prepare('delete from v where u = ? and a = ?').bind(user_id, anim_id),
		d.prepare('update a set p = (select count(*) from v where v.a = ?1) where i = ?1').bind(anim_id)
	]);
}

export async function has_vote(d: D1Database, user_id: string, anim_id: string) {
	return !!(await d
		.prepare('select 1 from v where u = ? and a = ?')
		.bind(user_id, anim_id)
		.first());
}

type NoteDb = {
	id: string;
	author_id: string;
	content: string;
	t: number;
	username: string;
	avatar: string;
	display: string;
};

export async function list_notes(d: D1Database, anim_id: string) {
	const { results } = await d
		.prepare(
			'select n.i as id, n.x as content, n.t, n.u as author_id, u.n as username, u.a as avatar, u.d as display from n join u on u.i = n.u where n.a = ? order by n.t desc'
		)
		.bind(anim_id)
		.all<NoteDb>();
	return results.map((r) => ({
		id: r.id,
		content: r.content,
		created_at: iso(r.t),
		author_id: r.author_id,
		author: {
			username: r.username,
			avatar_url: r.avatar || null,
			display_name: r.display || r.username
		}
	}));
}

export async function insert_note(
	d: D1Database,
	user_id: string,
	anim_id: string,
	content: string
) {
	const id = crypto.randomUUID();
	const t = Date.now();
	await d.batch([
		d
			.prepare('insert into n (i, a, u, x, t) values (?, ?, ?, ?, ?)')
			.bind(id, anim_id, user_id, content, t),
		d.prepare('update a set n = (select count(*) from n where n.a = ?1) where i = ?1').bind(anim_id)
	]);
	return { id, content, created_at: iso(t), author_id: user_id, post_id: anim_id };
}

const comm_sel =
	'select i as id, s as name, n as display_name, d as description, a as avatar_url, b as banner_url, m as member_count, u as creator_id from c';

export async function list_comms(d: D1Database, q: string) {
	const s = q
		? d.prepare(`${comm_sel} where n like ?1 or s like ?1 order by n collate nocase`).bind(`%${q}%`)
		: d.prepare(`${comm_sel} order by n collate nocase`);
	return (await s.all<CommRow>()).results;
}

export async function comm_by_slug(d: D1Database, slug: string, viewer = '') {
	const r = await d.prepare(`${comm_sel} where s = ?`).bind(slug).first<CommRow>();
	if (!r) return null;
	const j = viewer
		? !!(await d.prepare('select 1 from cm where c = ? and u = ?').bind(r.id, viewer).first())
		: false;
	return { ...r, j };
}

export async function insert_comm(d: D1Database, user_id: string, slug: string, name: string) {
	const id = crypto.randomUUID();
	const t = Date.now();
	await d.batch([
		d
			.prepare('insert into c (i, s, n, u, t, m) values (?, ?, ?, ?, ?, 1)')
			.bind(id, slug, name, user_id, t),
		d.prepare('insert into cm (c, u, t) values (?, ?, ?)').bind(id, user_id, t)
	]);
	return comm_by_slug(d, slug, user_id);
}

export async function set_member(d: D1Database, user_id: string, comm_id: string, on: boolean) {
	const exists = await d.prepare('select i from c where i = ?').bind(comm_id).first();
	if (!exists) return 'not found';
	await d.batch([
		on
			? d
					.prepare('insert or ignore into cm (c, u, t) values (?, ?, ?)')
					.bind(comm_id, user_id, Date.now())
			: d.prepare('delete from cm where c = ? and u = ?').bind(comm_id, user_id),
		d
			.prepare('update c set m = (select count(*) from cm where cm.c = ?1) where i = ?1')
			.bind(comm_id)
	]);
	return 'ok';
}

type ListDb = Omit<ListRow, 'created_at'> & { t: number };

const list_sel = 'select i as id, n as name, d as description, u as user_id, t from l';

const to_list = ({ t, ...x }: ListDb): ListRow => ({ ...x, created_at: iso(t) });

export async function list_lists(d: D1Database, user_id: string) {
	const { results } = await d
		.prepare(`${list_sel} where u = ? order by t desc`)
		.bind(user_id)
		.all<ListDb>();
	return results.map(to_list);
}

export async function get_list(d: D1Database, id: string, viewer = '') {
	const r = await d.prepare(`${list_sel} where i = ?`).bind(id).first<ListDb>();
	if (!r) return null;
	const { results } = await d
		.prepare(
			`select li.i as item_id, s.* from li join (${anim_sel}) s on s.id = li.a where li.l = ? order by li.t`
		)
		.bind(viewer, id)
		.all<AnimDb & { item_id: string }>();
	return {
		item: to_list(r),
		items: results.map((x) => ({ id: x.item_id, animations: to_anim(x) }))
	};
}

export async function insert_list(
	d: D1Database,
	user_id: string,
	name: string,
	description: string | null
) {
	const row: ListRow = {
		id: crypto.randomUUID(),
		name,
		description,
		user_id,
		created_at: iso(Date.now())
	};
	await d
		.prepare('insert into l (i, u, n, d, t) values (?, ?, ?, ?, ?)')
		.bind(row.id, user_id, name, description, Date.parse(row.created_at))
		.run();
	return row;
}

export async function insert_item(
	d: D1Database,
	user_id: string,
	list_id: string,
	anim_id: string
) {
	const owner = await d.prepare('select u from l where i = ?').bind(list_id).first<{ u: string }>();
	if (!owner) return 'not found';
	if (owner.u !== user_id) return 'not your playlist';
	try {
		await d
			.prepare('insert into li (i, l, a, t) values (?, ?, ?, ?)')
			.bind(crypto.randomUUID(), list_id, anim_id, Date.now())
			.run();
	} catch (e) {
		if (fails(e, 'li.l')) return 'duplicate key value';
		if (fails(e, 'FOREIGN KEY')) return 'not found';
		throw e;
	}
	return 'ok';
}

export type Own = 'ok' | 'not found' | 'forbidden';

const media_key = (p: string | null) => (p?.startsWith('/media/') ? p.slice(7) : null);

async function owner_of(d: D1Database, table: 'a' | 'n' | 'l', id: string, user_id: string) {
	const r = await d.prepare(`select u from ${table} where i = ?`).bind(id).first<{ u: string }>();
	return (!r ? 'not found' : r.u === user_id ? 'ok' : 'forbidden') as Own;
}

export async function update_anim(
	d: D1Database,
	user_id: string,
	id: string,
	v: { title: string; description: string | null }
) {
	const r = await owner_of(d, 'a', id, user_id);
	if (r === 'ok')
		await d
			.prepare('update a set ti = ?, d = ? where i = ?')
			.bind(v.title, v.description, id)
			.run();
	return r;
}

export async function delete_anim(d: D1Database, user_id: string, id: string) {
	const r = await owner_of(d, 'a', id, user_id);
	if (r !== 'ok') return { r, keys: [] as string[] };
	const m = await d
		.prepare('select v, im from a where i = ?')
		.bind(id)
		.first<{ v: string | null; im: string | null }>();
	await d.prepare('delete from a where i = ?').bind(id).run();
	return {
		r,
		keys: [media_key(m?.v ?? null), media_key(m?.im ?? null)].filter((k): k is string => !!k)
	};
}

export async function delete_note(d: D1Database, user_id: string, id: string) {
	const r = await owner_of(d, 'n', id, user_id);
	if (r !== 'ok') return r;
	const n = await d.prepare('select a from n where i = ?').bind(id).first<{ a: string }>();
	await d.batch([
		d.prepare('delete from n where i = ?').bind(id),
		d.prepare('update a set n = (select count(*) from n where n.a = ?1) where i = ?1').bind(n!.a)
	]);
	return r;
}

export async function update_list(
	d: D1Database,
	user_id: string,
	id: string,
	v: { name: string; description: string | null }
) {
	const r = await owner_of(d, 'l', id, user_id);
	if (r === 'ok')
		await d.prepare('update l set n = ?, d = ? where i = ?').bind(v.name, v.description, id).run();
	return r;
}

export async function delete_list(d: D1Database, user_id: string, id: string) {
	const r = await owner_of(d, 'l', id, user_id);
	if (r === 'ok') await d.prepare('delete from l where i = ?').bind(id).run();
	return r;
}

export async function delete_item(d: D1Database, user_id: string, item_id: string) {
	const it = await d.prepare('select l from li where i = ?').bind(item_id).first<{ l: string }>();
	if (!it) return 'not found' as Own;
	const r = await owner_of(d, 'l', it.l, user_id);
	if (r === 'ok') await d.prepare('delete from li where i = ?').bind(item_id).run();
	return r;
}

export async function set_pass(d: D1Database, id: string, pass: string) {
	await d.prepare('update u set p = ? where i = ?').bind(pass, id).run();
}

export async function insert_session(d: D1Database, id: string, user_id: string, exp: number) {
	await d.prepare('delete from s where u = ? and x <= ?').bind(user_id, Date.now()).run();
	await d
		.prepare('insert into s (i, u, x, t) values (?, ?, ?, ?)')
		.bind(id, user_id, exp, Date.now())
		.run();
}

export async function session_user(d: D1Database, id: string) {
	const r = await d
		.prepare('select u, x from s where i = ?')
		.bind(id)
		.first<{ u: string; x: number }>();
	if (!r || r.x <= Date.now()) return null;
	return r.u;
}

export async function delete_session(d: D1Database, id: string) {
	await d.prepare('delete from s where i = ?').bind(id).run();
}

export async function delete_other_sessions(d: D1Database, user_id: string, keep: string) {
	await d.prepare('delete from s where u = ? and i != ?').bind(user_id, keep).run();
}

export async function delete_user(d: D1Database, id: string) {
	const { results } = await d
		.prepare('select v, im from a where u = ?')
		.bind(id)
		.all<{ v: string | null; im: string | null }>();
	const u = await user_by_id(d, id);
	await d.prepare('delete from u where i = ?').bind(id).run();
	return [...results.flatMap((m) => [m.v, m.im]), u?.avatar_url ?? null]
		.map(media_key)
		.filter((k): k is string => !!k);
}
