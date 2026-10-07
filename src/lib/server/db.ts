import { error } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';
import { as_doc, embed, gemini_key } from './embed';

type VecMeta = Record<string, string | number | boolean | string[]>;
type Vec = { id: string; metadata?: VecMeta };
type VecIndex = {
	query(
		vector: number[],
		opts?: { topK?: number; returnMetadata?: 'all' | 'indexed' | 'none'; filter?: Record<string, unknown> }
	): Promise<{ matches: Array<Vec & { score: number }> }>;
	upsert(vectors: Array<{ id: string; values: number[]; metadata?: VecMeta }>): Promise<unknown>;
	getByIds(ids: string[]): Promise<Vec[]>;
	deleteByIds(ids: string[]): Promise<unknown>;
};

export function db(p?: App.Platform) {
	const x = p?.env?.V;
	if (!x) throw error(500, 'no vectorize');
	return x;
}

function seed(id: string, meta: VecMeta) {
	const raw = typeof meta.j === 'string' ? meta.j : '';
	let title = typeof meta.n === 'string' ? meta.n : id;
	let text = raw || id;
	if (raw.startsWith('{')) {
		try {
			const o = JSON.parse(raw) as Record<string, unknown>;
			title = String(o.title || o.display_name || o.username || o.name || title);
			text = String(o.description || o.content || o.bio || o.email || text);
		} catch {
			/* keep */
		}
	}
	return as_doc(title, text);
}

export async function put(d: VecIndex, id: string, meta: VecMeta, p?: App.Platform) {
	await d.upsert([{ id, values: await embed(seed(id, meta), gemini_key(p)), metadata: meta }]);
}

export async function one(d: VecIndex, id: string) {
	const [r] = await d.getByIds([id]);
	return r ?? null;
}

export async function many(d: VecIndex, ids: string[]) {
	const out: Vec[] = [];
	for (let i = 0; i < ids.length; i += 100) out.push(...(await d.getByIds(ids.slice(i, i + 100))));
	return out;
}

export function parse<T>(r: Vec | null | undefined): T | null {
	const j = r?.metadata?.j;
	if (typeof j !== 'string' || !j) return null;
	try {
		return JSON.parse(j) as T;
	} catch {
		return null;
	}
}

export async function cat_add(d: VecIndex, k: string, id: string, p?: App.Platform) {
	const cid = `cat:${k}`;
	const cur = await one(d, cid);
	const s = typeof cur?.metadata?.s === 'string' ? cur.metadata.s : '';
	const ids = s.split(',').filter(Boolean);
	if (ids.includes(id)) return;
	ids.push(id);
	await put(d, cid, { k: 'z', s: ids.join(',') }, p);
}

export async function cat_ids(d: VecIndex, k: string) {
	const cur = await one(d, `cat:${k}`);
	const s = typeof cur?.metadata?.s === 'string' ? cur.metadata.s : '';
	return s.split(',').filter(Boolean);
}

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

export type AnimRow = {
	id: string;
	title: string;
	description: string | null;
	thumbnail_url: string | null;
	video_url: string | null;
	upvote_count: number;
	comment_count: number;
	created_at: string;
	author_id: string;
	community_id: string | null;
};

export type PostRow = AnimRow & { content: string | null };
export type CommRow = {
	id: string;
	name: string;
	display_name: string;
	description: string | null;
	avatar_url: string | null;
	banner_url: string | null;
	member_count: number;
	creator_id: string;
};
export type ListRow = { id: string; name: string; description: string | null; user_id: string; created_at: string };
export type ItemRow = { id: string; playlist_id: string; animation_id: string };
export type NoteRow = { id: string; content: string; created_at: string; author_id: string; post_id: string };

export function person(u: UserRow | null): { username: string; avatar_url: string | null; display_name: string | null } {
	return {
		username: u?.username || 'user',
		avatar_url: u?.avatar_url || null,
		display_name: u?.display_name || u?.username || null
	};
}

export async function hydrate(d: VecIndex, row: AnimRow) {
	const author = parse<UserRow>(await one(d, row.author_id));
	const comm = row.community_id ? parse<CommRow>(await one(d, row.community_id)) : null;
	return {
		...row,
		author: person(author),
		community: comm ? { name: comm.name, display_name: comm.display_name } : null
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
		.prepare('insert into u (i, e, n, d, p, t) values (?, ?, ?, ?, ?, ?)')
		.bind(u.id, u.email, u.username, u.display_name, u.pass, Date.parse(u.created_at))
		.run();
}

export async function user_by_id(d: D1Database, id: string) {
	return to_user(await d.prepare(`${user_sel} where i = ?`).bind(id).first<UserDb>());
}

export async function user_by_email(d: D1Database, email: string) {
	return to_user(await d.prepare(`${user_sel} where e = ?`).bind(email).first<UserDb>());
}

export async function save_profile(
	d: D1Database,
	id: string,
	v: { display_name: string; bio: string; location: string; website_url: string }
) {
	await d
		.prepare('update u set d = ?, b = ?, l = ?, w = ? where i = ?')
		.bind(v.display_name, v.bio, v.location, v.website_url, id)
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
};

const anim_sel = `select a.i as id, a.ti as title, a.d as description, a.im as thumbnail_url, a.v as video_url,
	a.p as upvote_count, a.n as comment_count, a.t, a.u as author_id, a.c as community_id,
	u.n as author_username, u.a as author_avatar, u.d as author_display, c.s as community_name, c.n as community_display
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
		community: r.community_name ? { name: r.community_name, display_name: r.community_display || r.community_name } : null
	};
}

export async function list_anims(d: D1Database, o: { sort: 'new' | 'top'; community_id?: string; author_id?: string }) {
	const w: string[] = [];
	const b: string[] = [];
	if (o.community_id) {
		w.push('a.c = ?');
		b.push(o.community_id);
	}
	if (o.author_id) {
		w.push('a.u = ?');
		b.push(o.author_id);
	}
	const q = `${anim_sel}${w.length ? ` where ${w.join(' and ')}` : ''} order by ${o.sort === 'top' ? 'a.p desc, ' : ''}a.t desc limit 20`;
	const { results } = await d.prepare(q).bind(...b).all<AnimDb>();
	return results.map(to_anim);
}

export async function get_anim(d: D1Database, id: string) {
	const r = await d.prepare(`${anim_sel} where a.i = ?`).bind(id).first<AnimDb>();
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
		.bind(id, x.author_id, x.community_id, x.title, x.description, x.video_url, x.thumbnail_url, Date.now())
		.run();
	return get_anim(d, id);
}

export async function set_vote(d: D1Database, user_id: string, anim_id: string, on: boolean) {
	await d.batch([
		on
			? d.prepare('insert or ignore into v (u, a, t) values (?, ?, ?)').bind(user_id, anim_id, Date.now())
			: d.prepare('delete from v where u = ? and a = ?').bind(user_id, anim_id),
		d.prepare('update a set p = (select count(*) from v where v.a = ?1) where i = ?1').bind(anim_id)
	]);
}

export async function has_vote(d: D1Database, user_id: string, anim_id: string) {
	return !!(await d.prepare('select 1 from v where u = ? and a = ?').bind(user_id, anim_id).first());
}

type NoteDb = { id: string; content: string; t: number; username: string; avatar: string; display: string };

export async function list_notes(d: D1Database, anim_id: string) {
	const { results } = await d
		.prepare(
			'select n.i as id, n.x as content, n.t, u.n as username, u.a as avatar, u.d as display from n join u on u.i = n.u where n.a = ? order by n.t desc'
		)
		.bind(anim_id)
		.all<NoteDb>();
	return results.map((r) => ({
		id: r.id,
		content: r.content,
		created_at: iso(r.t),
		author: { username: r.username, avatar_url: r.avatar || null, display_name: r.display || r.username }
	}));
}

export async function insert_note(d: D1Database, user_id: string, anim_id: string, content: string) {
	const id = crypto.randomUUID();
	const t = Date.now();
	await d.batch([
		d.prepare('insert into n (i, a, u, x, t) values (?, ?, ?, ?, ?)').bind(id, anim_id, user_id, content, t),
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

export async function comm_by_slug(d: D1Database, slug: string) {
	return d.prepare(`${comm_sel} where s = ?`).bind(slug).first<CommRow>();
}

export async function insert_comm(d: D1Database, user_id: string, slug: string, name: string) {
	const id = crypto.randomUUID();
	await d.prepare('insert into c (i, s, n, u, t) values (?, ?, ?, ?, ?)').bind(id, slug, name, user_id, Date.now()).run();
	return comm_by_slug(d, slug);
}

type ListDb = Omit<ListRow, 'created_at'> & { t: number };

const list_sel = 'select i as id, n as name, d as description, u as user_id, t from l';

const to_list = ({ t, ...x }: ListDb): ListRow => ({ ...x, created_at: iso(t) });

export async function list_lists(d: D1Database, user_id: string) {
	const { results } = await d.prepare(`${list_sel} where u = ? order by t desc`).bind(user_id).all<ListDb>();
	return results.map(to_list);
}

export async function get_list(d: D1Database, id: string) {
	const r = await d.prepare(`${list_sel} where i = ?`).bind(id).first<ListDb>();
	if (!r) return null;
	const { results } = await d
		.prepare(`select li.i as item_id, s.* from li join (${anim_sel}) s on s.id = li.a where li.l = ? order by li.t`)
		.bind(id)
		.all<AnimDb & { item_id: string }>();
	return { item: to_list(r), items: results.map((x) => ({ id: x.item_id, animations: to_anim(x) })) };
}

export async function insert_list(d: D1Database, user_id: string, name: string, description: string | null) {
	const row: ListRow = { id: crypto.randomUUID(), name, description, user_id, created_at: iso(Date.now()) };
	await d
		.prepare('insert into l (i, u, n, d, t) values (?, ?, ?, ?, ?)')
		.bind(row.id, user_id, name, description, Date.parse(row.created_at))
		.run();
	return row;
}

export async function insert_item(d: D1Database, user_id: string, list_id: string, anim_id: string) {
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
