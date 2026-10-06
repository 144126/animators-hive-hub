import { error } from '@sveltejs/kit';
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
	const x = p?.env?.DB;
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
