<script lang="ts">
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	let { items, sort }: { items: Animation[]; sort: 'new' | 'top' } = $props();
</script>

<div class="space-y-6">
	<form method="GET" class="flex space-x-2">
		<button class={sort === 'new' ? 'btn-sm' : 'btn-outline-sm'} name="sort" value="new">new</button
		>
		<button class={sort === 'top' ? 'btn-sm' : 'btn-outline-sm'} name="sort" value="top">top</button
		>
	</form>
	{#if items.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each items as animation (animation.id)}
				<AnimationCard {animation} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">no content found</p>
			<p class="mt-2 text-sm text-muted-foreground">be the first to share your work!</p>
		</div>
	{/if}
</div>
