<script lang="ts">
	import { list_animations } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	let {
		items,
		sort,
		community_id,
		q = ''
	}: { items: Animation[]; sort: 'new' | 'top'; community_id?: string; q?: string } = $props();
	let extra = $state<Animation[]>([]);
	let done = $state(false);
	let busy = $state(false);
	const list = $derived([...items, ...extra]);

	$effect(() => {
		void items;
		void sort;
		void community_id;
		void q;
		extra = [];
		done = items.length < 20;
	});

	async function more() {
		busy = true;
		try {
			const next = await list_animations({
				sort,
				community_id,
				q: q || undefined,
				offset: items.length + extra.length
			});
			extra = [...extra, ...next];
			done = next.length < 20;
		} catch (e) {
			toast('error', e instanceof Error ? e.message : 'failed to load more', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center gap-2">
		<form method="GET" class="flex min-w-0 gap-2">
			<input type="hidden" name="sort" value={sort} />
			<input class="field w-56" name="q" value={q} placeholder="search" aria-label="search" />
		</form>
		<form method="GET" class="flex gap-2">
			<input type="hidden" name="q" value={q} />
			<button class={sort === 'new' ? 'btn-sm' : 'btn-outline-sm'} name="sort" value="new"
				>new</button
			>
			<button class={sort === 'top' ? 'btn-sm' : 'btn-outline-sm'} name="sort" value="top"
				>top</button
			>
		</form>
	</div>
	{#if list.length}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each list as animation (animation.id)}
				<AnimationCard {animation} />
			{/each}
		</div>
	{:else}
		<div class="py-16 text-center">
			<p class="text-ink-soft">{q ? 'nothing matches' : 'nothing here yet'}</p>
			{#if !q}
				<p class="mt-2 text-sm text-mute">be the first to share a piece</p>
			{/if}
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
