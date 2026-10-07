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
	author_id?: string;
	community_id?: string | null;
	author: Person;
	community?: CommunityRef | null;
	voted?: boolean;
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

export type Community = {
	id: string;
	name: string;
	display_name: string;
	description: string | null;
	avatar_url: string | null;
	banner_url?: string | null;
	member_count: number;
	creator_id?: string;
};

export type AuthUser = {
	id: string;
	email: string;
	created_at: string;
	user_metadata: {
		username: string;
		display_name?: string;
		bio?: string;
		avatar_url?: string;
		location?: string;
		website_url?: string;
	};
};
