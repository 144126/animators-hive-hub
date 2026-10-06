<script lang="ts">
	import { ArrowLeft, Play, MessageCircle } from '@lucide/svelte';
	import type { Post } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import CommentsSection from './CommentsSection.svelte';
	import UpvoteButton from './UpvoteButton.svelte';

	let { post }: { post: Post } = $props();
</script>

<div class="min-h-screen bg-background">
	<div class="container mx-auto max-w-4xl px-4 py-6">
		<button class="btn-ghost mb-6" type="button" onclick={() => history.back()}>
			<ArrowLeft class="mr-2 h-4 w-4" /> back
		</button>
		<div class="space-y-6">
			<div class="card overflow-hidden">
				<div class="relative aspect-video bg-black">
					{#if post.video_url}
						<video src={post.video_url} poster={post.thumbnail_url || undefined} controls class="h-full w-full">
							<track kind="captions" />
						</video>
					{:else if post.thumbnail_url}
						<img src={post.thumbnail_url} alt={post.title} class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
							<Play class="h-16 w-16 text-primary/50" />
						</div>
					{/if}
				</div>
			</div>
			<div class="space-y-4">
				<h1 class="text-3xl font-bold">{post.title}</h1>
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<Avatar src={post.author.avatar_url} name={post.author.username} class="h-10 w-10" />
						<div>
							<p class="font-medium">{post.author.display_name || post.author.username}</p>
							<p class="text-sm text-muted-foreground">@{post.author.username}</p>
						</div>
					</div>
					{#if post.community}
						<span class="rounded-full bg-secondary px-2 py-0.5 text-sm">{post.community.display_name}</span>
					{/if}
				</div>
				<div class="flex items-center space-x-6">
					<UpvoteButton post_id={post.id} count={post.upvote_count} />
					<div class="flex items-center space-x-1 text-muted-foreground">
						<MessageCircle class="h-4 w-4" />
						<span>{post.comment_count ?? 0} comments</span>
					</div>
					<span class="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
				</div>
				{#if post.content}
					<div class="card p-6">
						<h3 class="mb-3 font-semibold">description</h3>
						<p class="whitespace-pre-wrap text-muted-foreground">{post.content}</p>
					</div>
				{/if}
			</div>
			<CommentsSection post_id={post.id} />
		</div>
	</div>
</div>
