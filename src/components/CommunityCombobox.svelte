<script lang="ts">
	import { Check, ChevronsUpDown, Plus } from '@lucide/svelte';
	import { search_communities } from '$lib/data';
	import { cn } from '$lib/utils';

	let { value = $bindable(''), disabled = false }: { value?: string; disabled?: boolean } =
		$props();
	let open = $state(false);
	let term = $state('');
	let communities = $state<{ id: string; name: string; display_name: string }[]>([]);

	$effect(() => {
		search_communities(term).then((d) => (communities = d));
	});

	const selected = $derived(communities.find((c) => c.id === value));
	const label = $derived(
		value === 'none'
			? 'no community'
			: value === 'create-new'
				? 'create new community'
				: selected?.display_name || 'select a community'
	);

	function pick(v: string) {
		value = v;
		open = false;
	}
</script>

<div class="relative">
	<button
		type="button"
		class="btn-outline w-full justify-between"
		onclick={() => (open = !open)}
		{disabled}
	>
		{label}
		<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
	</button>
	{#if open}
		<div class="absolute z-20 mt-1 w-full rounded-md border bg-background shadow">
			<input
				class="field border-0 border-b"
				placeholder="search communities..."
				bind:value={term}
			/>
			<div class="max-h-56 overflow-y-auto py-1">
				<button
					type="button"
					class="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
					onclick={() => pick('none')}
				>
					<Check class={cn('mr-2 h-4 w-4', value === 'none' ? 'opacity-100' : 'opacity-0')} /> no community
				</button>
				<button
					type="button"
					class="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
					onclick={() => pick('create-new')}
				>
					<Check class={cn('mr-2 h-4 w-4', value === 'create-new' ? 'opacity-100' : 'opacity-0')} />
					<Plus class="mr-2 h-4 w-4" /> create new community
				</button>
				{#each communities as c (c.id)}
					<button
						type="button"
						class="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
						onclick={() => pick(c.id)}
					>
						<Check class={cn('mr-2 h-4 w-4', value === c.id ? 'opacity-100' : 'opacity-0')} />
						{c.display_name}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
