<script lang="ts">
	import { resolve } from '$app/paths';
	import { Video, MessageCircle } from '@lucide/svelte';
	import type { Animation } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import UpvoteButton from './UpvoteButton.svelte';
	import AddToPlaylistModal from './AddToPlaylistModal.svelte';

	let { animation }: { animation: Animation } = $props();
</script>

<div class="card overflow-hidden hover:shadow-lg">
	<a href={resolve('/animation/[animationId]', { animationId: animation.id })} class="block">
		<div class="relative aspect-video overflow-hidden bg-muted">
			{#if animation.thumbnail_url}
				<img
					src={animation.thumbnail_url}
					alt={animation.title}
					class="h-full w-full object-cover transition-transform hover:scale-105"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<Video class="h-12 w-12 text-muted-foreground" />
				</div>
			{/if}
		</div>
	</a>
	<div class="p-4">
		<a href={resolve('/animation/[animationId]', { animationId: animation.id })}>
			<h3 class="mb-2 line-clamp-2 font-semibold hover:text-primary">{animation.title}</h3>
		</a>
		{#if animation.description}
			<p class="mb-3 line-clamp-2 text-sm text-muted-foreground">{animation.description}</p>
		{/if}
		<div class="mb-3 flex items-center justify-between">
			<a
				href={resolve('/u/[username]', { username: animation.author.username })}
				class="flex items-center space-x-2 hover:underline"
			>
				<Avatar
					src={animation.author.avatar_url}
					name={animation.author.username}
					class="h-6 w-6"
				/>
				<span class="text-sm text-muted-foreground">{animation.author.username}</span>
			</a>
			{#if animation.community}
				<a
					href={resolve('/c/[communityName]', { communityName: animation.community.name })}
					class="text-xs text-primary hover:underline">{animation.community.display_name}</a
				>
			{/if}
		</div>
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-1 text-sm text-muted-foreground">
				<MessageCircle class="h-4 w-4" /><span>{animation.comment_count}</span>
			</div>
			<div class="flex items-center space-x-2">
				<UpvoteButton
					post_id={animation.id}
					count={animation.upvote_count}
					voted={animation.voted}
				/>
				<AddToPlaylistModal animation_id={animation.id} title={animation.title} />
			</div>
		</div>
	</div>
</div>
