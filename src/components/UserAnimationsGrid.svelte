<script lang="ts">
	import { list_animations } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	let { items, author_id }: { items: Animation[]; author_id: string } = $props();
	let extra = $state<Animation[]>([]);
	let done = $state(false);
	let busy = $state(false);
	const list = $derived([...items, ...extra]);

	$effect(() => {
		void items;
		void author_id;
		extra = [];
		done = items.length < 20;
	});

	async function more() {
		busy = true;
		try {
			const next = await list_animations({
				sort: 'new',
				author_id,
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

{#if !list.length}
	<div class="py-16 text-center">
		<p class="text-ink-soft">no animations yet</p>
		<p class="mt-2 text-sm text-mute">share a piece to see it here</p>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each list as animation (animation.id)}
			<AnimationCard {animation} />
		{/each}
	</div>

	{#if !done}
		<div class="mt-6 flex justify-center">
			<button class="btn-outline" type="button" onclick={more} disabled={busy}>
				{busy ? 'loading...' : 'load more'}
			</button>
		</div>
	{/if}
{/if}
