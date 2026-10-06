import { supabase } from './supabase';
import type { Animation, Comment, Playlist, Post } from './types';

const animation_sel = `
	id, title, description, thumbnail_url, video_url, upvote_count, comment_count, created_at,
	author:users!author_id (username, avatar_url, display_name),
	community:communities (name, display_name)
`;

const post_sel = `
	id, title, content, thumbnail_url, video_url, upvote_count, comment_count, created_at,
	author:users!author_id (username, avatar_url, display_name),
	community:communities (name, display_name)
`;

export async function list_animations(sort: 'new' | 'top', community_id?: string) {
	let q = supabase.from('animations').select(animation_sel);
	if (community_id) q = q.eq('community_id', community_id);
	q = sort === 'new' ? q.order('created_at', { ascending: false }) : q.order('upvote_count', { ascending: false });
	const { data, error } = await q.limit(20);
	if (error) throw error;
	return (data ?? []) as unknown as Animation[];
}

export async function list_posts(sort: 'new' | 'top', community_id?: string) {
	let q = supabase.from('posts').select(post_sel);
	if (community_id) q = q.eq('community_id', community_id);
	q = sort === 'new' ? q.order('created_at', { ascending: false }) : q.order('upvote_count', { ascending: false });
	const { data, error } = await q.limit(20);
	if (error) throw error;
	return (data ?? []) as unknown as Post[];
}

export async function get_animation(id: string) {
	const { data, error } = await supabase.from('animations').select(animation_sel).eq('id', id).single();
	if (error) throw error;
	return data as unknown as Animation;
}

export async function get_post(id: string) {
	const { data, error } = await supabase.from('posts').select(post_sel).eq('id', id).single();
	if (error) throw error;
	return data as unknown as Post;
}

export async function list_communities() {
	const { data, error } = await supabase
		.from('communities')
		.select('id, name, display_name, description, avatar_url, member_count')
		.order('display_name');
	if (error) throw error;
	return data ?? [];
}

export async function search_communities(term: string) {
	let q = supabase.from('communities').select('id, name, display_name').order('display_name');
	if (term) q = q.ilike('display_name', `%${term}%`);
	const { data, error } = await q.limit(50);
	if (error) throw error;
	return data ?? [];
}

export async function get_community(name: string) {
	const { data, error } = await supabase
		.from('communities')
		.select('id, display_name, description, avatar_url, banner_url')
		.eq('name', name)
		.single();
	if (error) return null;
	return data;
}

export async function user_animations(user_id: string) {
	const { data, error } = await supabase
		.from('animations')
		.select(`${animation_sel}`)
		.eq('author_id', user_id)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data ?? []) as unknown as Animation[];
}

export async function user_playlists(user_id: string) {
	const { data, error } = await supabase
		.from('playlists')
		.select('id, name, description')
		.eq('user_id', user_id)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data ?? []) as Playlist[];
}

export async function get_playlist(id: string) {
	const { data, error } = await supabase
		.from('playlists')
		.select('id, name, description, user_id, created_at')
		.eq('id', id)
		.single();
	if (error) throw error;
	return data as Playlist & { user_id: string; created_at: string };
}

export async function playlist_items(playlist_id: string) {
	const { data, error } = await supabase
		.from('playlist_items')
		.select(
			`
			id, post_id,
			animations:post_id (
				id, title, description, thumbnail_url, video_url, upvote_count, comment_count, created_at,
				author:users!animations_author_id_fkey(username, avatar_url),
				community:communities(name, display_name)
			)
		`
		)
		.eq('playlist_id', playlist_id)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data ?? []) as unknown as { id: string; post_id: string; animations: Animation | null }[];
}

export async function list_comments(post_id: string) {
	const { data, error } = await supabase
		.from('comments')
		.select(
			`
			id, content, created_at,
			author:users!author_id (username, avatar_url, display_name)
		`
		)
		.eq('post_id', post_id)
		.is('parent_id', null)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data ?? []) as unknown as Comment[];
}

export async function has_upvote(user_id: string, post_id: string) {
	const { data, error } = await supabase
		.from('upvotes')
		.select('id')
		.eq('post_id', post_id)
		.eq('user_id', user_id)
		.maybeSingle();
	if (error && error.code !== 'PGRST116') return false;
	return !!data;
}

export async function has_animation_upvote(user_id: string, animation_id: string) {
	const { data, error } = await supabase
		.from('upvotes')
		.select('id')
		.eq('animation_id', animation_id)
		.eq('user_id', user_id)
		.maybeSingle();
	if (error && error.code !== 'PGRST116') return false;
	return !!data;
}
