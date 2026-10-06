<script lang="ts">
	import { Video } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { user_animations } from '$lib/data';
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	const a = auth();
	let animations = $state<Animation[]>([]);
	let loading = $state(true);
	let err = $state(false);

	$effect(() => {
		const uid = a.user?.id;
		if (!uid) return;
		loading = true;
		user_animations(uid)
			.then((d) => (animations = d))
			.catch(() => (err = true))
			.finally(() => (loading = false));
	});
</script>

{#if loading}
	<div class="py-12 text-center">
		<div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
		<p class="text-muted-foreground">loading animations...</p>
	</div>
{:else if err}
	<div class="py-12 text-center text-destructive">failed to load animations</div>
{:else if !animations.length}
	<div class="py-12 text-center">
		<Video class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
		<p class="text-muted-foreground">no animations yet</p>
		<p class="mt-2 text-sm text-muted-foreground">start sharing your work to see it here!</p>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each animations as animation (animation.id)}
			<AnimationCard {animation} />
		{/each}
	</div>
{/if}
