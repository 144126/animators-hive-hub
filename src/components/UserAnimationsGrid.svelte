<script lang="ts">
	import { Video } from '@lucide/svelte';
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	let { items }: { items: Animation[] } = $props();
</script>

{#if !items.length}
	<div class="py-12 text-center">
		<Video class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
		<p class="text-muted-foreground">no animations yet</p>
		<p class="mt-2 text-sm text-muted-foreground">start sharing your work to see it here!</p>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each items as animation (animation.id)}
			<AnimationCard {animation} />
		{/each}
	</div>
{/if}
