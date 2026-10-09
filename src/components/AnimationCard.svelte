<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Animation } from '$lib/types';
	import Avatar from './Avatar.svelte';
	import UpvoteButton from './UpvoteButton.svelte';
	import AddToPlaylistModal from './AddToPlaylistModal.svelte';

	let { animation }: { animation: Animation } = $props();
</script>

<div class="card overflow-hidden transition-colors duration-300 hover:border-ember">
	<a href={resolve('/animation/[animationId]', { animationId: animation.id })} class="block">
		<div class="relative aspect-video overflow-hidden bg-panel-solid">
			{#if animation.thumbnail_url}
				<img
					src={animation.thumbnail_url}
					alt={animation.title}
					class="h-full w-full object-cover"
				/>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-mute"
				>
					no still
				</div>
			{/if}
		</div>
	</a>
	<div class="p-4">
		<a href={resolve('/animation/[animationId]', { animationId: animation.id })}>
			<h3 class="mb-2 line-clamp-2 font-medium hover:text-ember">{animation.title}</h3>
		</a>
		{#if animation.description}
			<p class="mb-3 line-clamp-2 text-sm text-ink-soft">{animation.description}</p>
		{/if}
		<div class="mb-3 flex items-center justify-between gap-2">
			<a
				href={resolve('/u/[username]', { username: animation.author.username })}
				class="flex min-w-0 items-center gap-2 hover:text-ink"
			>
				<Avatar
					src={animation.author.avatar_url}
					name={animation.author.username}
					class="h-6 w-6"
				/>
				<span class="truncate text-sm text-mute">{animation.author.username}</span>
			</a>
			{#if animation.community}
				<a
					href={resolve('/c/[communityName]', { communityName: animation.community.name })}
					class="shrink-0 text-[11px] uppercase tracking-[0.14em] text-ember hover:text-ink"
					>{animation.community.display_name}</a
				>
			{/if}
		</div>
		<div class="flex items-center justify-between">
			<span class="text-sm text-mute">{animation.comment_count}</span>
			<div class="flex items-center gap-2">
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
