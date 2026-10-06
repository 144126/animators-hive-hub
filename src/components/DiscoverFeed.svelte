<script lang="ts">
	import { Loader2 } from '@lucide/svelte';
	import { list_animations, list_posts } from '$lib/data';
	import type { Animation, Post } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';
	import PostCard from './PostCard.svelte';

	let { community_id = undefined as string | undefined } = $props();
	let sort = $state<'new' | 'top'>('new');
	let animations = $state<Animation[]>([]);
	let posts = $state<Post[]>([]);
	let loading = $state(true);
	let err = $state('');

	async function load() {
		loading = true;
		err = '';
		try {
			animations = await list_animations(sort, community_id);
			if (!animations.length) posts = await list_posts(sort, community_id);
			else posts = [];
		} catch (e) {
			err = e instanceof Error ? e.message : 'unknown error';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void sort;
		void community_id;
		load();
	});
</script>

<div class="space-y-6">
	<div class="flex space-x-2">
		<button class={sort === 'new' ? 'btn-sm' : 'btn-outline-sm'} type="button" onclick={() => (sort = 'new')}>new</button>
		<button class={sort === 'top' ? 'btn-sm' : 'btn-outline-sm'} type="button" onclick={() => (sort = 'top')}>top</button>
	</div>
	{#if err && !animations.length && !posts.length}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">failed to load content</p>
			<p class="mt-2 text-sm text-muted-foreground">{err}</p>
		</div>
	{:else if loading}
		<div class="py-12 text-center">
			<Loader2 class="mx-auto mb-4 h-8 w-8 animate-spin" />
			<p class="text-muted-foreground">loading content...</p>
		</div>
	{:else if animations.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each animations as animation (animation.id)}
				<AnimationCard {animation} />
			{/each}
		</div>
	{:else if posts.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each posts as post (post.id)}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">no content found</p>
			<p class="mt-2 text-sm text-muted-foreground">be the first to share your work!</p>
		</div>
	{/if}
</div>
