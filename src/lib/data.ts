import { api } from './http';
import type { Animation, Comment, Community, Playlist } from './types';

export async function list_animations(sort: 'new' | 'top', community_id?: string) {
	const q = new URLSearchParams({ sort });
	if (community_id) q.set('community_id', community_id);
	const { items } = await api<{ items: Animation[] }>(`/api/animations?${q}`);
	return items;
}


export async function get_animation(id: string) {
	const { item } = await api<{ item: Animation }>(`/api/animations/${id}`);
	return item;
}


export async function list_communities() {
	const { items } = await api<{ items: Community[] }>('/api/communities');
	return items;
}

export async function search_communities(term: string) {
	const { items } = await api<{ items: Community[] }>(`/api/communities?q=${encodeURIComponent(term)}`);
	return items.map((c) => ({ id: c.id, name: c.name, display_name: c.display_name }));
}

export async function get_community(name: string) {
	try {
		const { item } = await api<{ item: Community }>(`/api/communities/${encodeURIComponent(name)}`);
		return item;
	} catch {
		return null;
	}
}

export async function user_animations(user_id: string) {
	const { items } = await api<{ items: Animation[] }>(`/api/animations?author_id=${user_id}`);
	return items;
}

export async function user_playlists(user_id: string) {
	const { items } = await api<{ items: Playlist[] }>(`/api/playlists?user_id=${user_id}`);
	return items;
}

export async function get_playlist(id: string) {
	const { item } = await api<{ item: Playlist & { user_id: string; created_at: string } }>(`/api/playlists/${id}`);
	return item;
}

export async function playlist_items(playlist_id: string) {
	const { items } = await api<{ items: { id: string; animations: Animation | null }[] }>(`/api/playlists/${playlist_id}`);
	return items;
}

export async function list_comments(post_id: string) {
	const { items } = await api<{ items: Comment[] }>(`/api/comments?post_id=${post_id}`);
	return items;
}

export async function has_upvote(_user_id: string, post_id: string) {
	const { voted } = await api<{ voted: boolean }>(`/api/upvotes?target=${post_id}`);
	return voted;
}

export async function has_animation_upvote(user_id: string, animation_id: string) {
	return has_upvote(user_id, animation_id);
}

export async function create_community(name: string) {
	const { item } = await api<{ item: Community }>('/api/communities', {
		method: 'POST',
		body: JSON.stringify({ name })
	});
	return item.id;
}

export async function create_animation(body: {
	title: string;
	description: string | null;
	video_url: string | null;
	thumbnail_url: string | null;
	community_id: string | null;
}) {
	const { item } = await api<{ item: Animation }>('/api/animations', { method: 'POST', body: JSON.stringify(body) });
	return item;
}

export async function create_playlist(name: string, description: string | null) {
	const { item } = await api<{ item: Playlist }>('/api/playlists', {
		method: 'POST',
		body: JSON.stringify({ name, description })
	});
	return item;
}

export async function add_to_playlist(playlist_id: string, animation_id: string) {
	await api('/api/playlist-items', { method: 'POST', body: JSON.stringify({ playlist_id, animation_id }) });
}

export async function post_comment(post_id: string, content: string) {
	await api('/api/comments', { method: 'POST', body: JSON.stringify({ post_id, content }) });
}

export async function set_upvote(target: string, on: boolean) {
	await api('/api/upvotes', { method: 'POST', body: JSON.stringify({ target, on }) });
}

export async function update_profile(values: {
	display_name: string;
	bio: string;
	location: string;
	website_url: string;
}) {
	const { user } = await api<{ user: import('./types').AuthUser }>('/api/profile', {
		method: 'POST',
		body: JSON.stringify(values)
	});
	return user;
}
