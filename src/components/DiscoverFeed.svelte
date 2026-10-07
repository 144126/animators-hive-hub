<script lang="ts">
	import { list_animations } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	let {
		items,
		sort,
		community_id
	}: { items: Animation[]; sort: 'new' | 'top'; community_id?: string } = $props();
	const query = $derived({ sort, community_id });
	let list = $derived(items);
	let done = $derived(items.length < 20);
	let busy = $state(false);

	async function more() {
		busy = true;
		try {
			const next = await list_animations({ ...query, offset: list.length });
			list = [...list, ...next];
			done = next.length < 20;
		} catch (e) {
			toast('error', e instanceof Error ? e.message : 'failed to load more', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<div class="space-y-6">
	<form method="GET" class="flex space-x-2">
		<button class={sort === 'new' ? 'btn-sm' : 'btn-outline-sm'} name="sort" value="new">new</button
		>
		<button class={sort === 'top' ? 'btn-sm' : 'btn-outline-sm'} name="sort" value="top">top</button
		>
	</form>
	{#if list.length}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each list as animation (animation.id)}
				<AnimationCard {animation} />
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">no content found</p>
			<p class="mt-2 text-sm text-muted-foreground">be the first to share your work!</p>
		</div>
	{/if}
	{#if !done}
		<div class="flex justify-center">
			<button class="btn-outline" type="button" onclick={more} disabled={busy}>
				{busy ? 'loading...' : 'load more'}
			</button>
		</div>
	{/if}
</div>
