<script lang="ts">
	import { Video } from '@lucide/svelte';
	import { list_animations } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import type { Animation } from '$lib/types';
	import AnimationCard from './AnimationCard.svelte';

	let { items, author_id }: { items: Animation[]; author_id: string } = $props();
	const query = $derived({ sort: 'new' as const, author_id });
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

{#if !list.length}
	<div class="py-12 text-center">
		<Video class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
		<p class="text-muted-foreground">no animations yet</p>
		<p class="mt-2 text-sm text-muted-foreground">start sharing your work to see it here!</p>
	</div>
{:else}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each list as animation (animation.id)}
			<AnimationCard {animation} />
		{/each}
	</div>

	{#if !done}
		<div class="flex justify-center">
			<button class="btn-outline" type="button" onclick={more} disabled={busy}>
				{busy ? 'loading...' : 'load more'}
			</button>
		</div>
	{/if}
{/if}
