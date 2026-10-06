export type Person = {
	username: string;
	avatar_url?: string | null;
	display_name?: string | null;
};

export type CommunityRef = {
	name: string;
	display_name: string;
};

export type Animation = {
	id: string;
	title: string;
	description?: string | null;
	thumbnail_url?: string | null;
	video_url?: string | null;
	upvote_count: number;
	comment_count: number;
	created_at: string;
	author: Person;
	community?: CommunityRef | null;
};

export type Post = {
	id: string;
	title: string;
	content?: string | null;
	thumbnail_url?: string | null;
	video_url?: string | null;
	upvote_count: number;
	comment_count?: number;
	created_at: string;
	author: Person;
	community?: CommunityRef | null;
};

export type Playlist = {
	id: string;
	name: string;
	description: string | null;
	user_id?: string;
	created_at?: string;
};

export type Comment = {
	id: string;
	content: string;
	created_at: string;
	author: Person;
};
