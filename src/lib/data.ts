import { api } from './http';
import type { Animation, Community, Playlist } from './types';

export async function search_communities(term: string) {
	const { items } = await api<{ items: Community[] }>(
		`/api/communities?q=${encodeURIComponent(term)}`
	);
	return items.map((c) => ({ id: c.id, name: c.name, display_name: c.display_name }));
}

export async function user_playlists(user_id: string) {
	const { items } = await api<{ items: Playlist[] }>(`/api/playlists?user_id=${user_id}`);
	return items;
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
	const { item } = await api<{ item: Animation }>('/api/animations', {
		method: 'POST',
		body: JSON.stringify(body)
	});
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
	await api('/api/playlist-items', {
		method: 'POST',
		body: JSON.stringify({ playlist_id, animation_id })
	});
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
