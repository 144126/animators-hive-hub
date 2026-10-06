<script lang="ts">
	import { Play } from '@lucide/svelte';
	import type { Post } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import UpvoteButton from './UpvoteButton.svelte';

	let { post }: { post: Post } = $props();
</script>

<a href="/post/{post.id}" class="card block overflow-hidden hover:shadow-lg">
	<div class="relative aspect-video bg-muted">
		{#if post.thumbnail_url}
			<img src={post.thumbnail_url} alt={post.title} class="h-full w-full object-cover" />
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
				<Play class="h-12 w-12 text-primary/50" />
			</div>
		{/if}
	</div>
	<div class="p-4">
		<h3 class="mb-2 line-clamp-2 text-lg font-semibold">{post.title}</h3>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-2">
				<Avatar src={post.author.avatar_url} name={post.author.username} class="h-6 w-6" />
				<span class="text-sm text-muted-foreground">{post.author.username}</span>
			</div>
			{#if post.community}
				<span class="rounded-full bg-secondary px-2 py-0.5 text-xs">{post.community.display_name}</span>
			{/if}
		</div>
		<div class="mt-3 flex items-center justify-between">
			<UpvoteButton post_id={post.id} count={post.upvote_count} variant="minimal" />
			<span class="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
		</div>
	</div>
</a>
