<script lang="ts">
	import { search_communities } from '$lib/data';
	import { cn } from '$lib/utils';

	let { value = $bindable(''), disabled = false }: { value?: string; disabled?: boolean } =
		$props();
	let open = $state(false);
	let term = $state('');
	let communities = $state<{ id: string; name: string; display_name: string }[]>([]);
	let picked = $state('');
	let n = 0;
	let wait: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (!open) return;
		const q = term;
		clearTimeout(wait);
		wait = setTimeout(() => {
			const id = ++n;
			search_communities(q).then((d) => {
				if (id === n) communities = d;
			});
		}, 200);
		return () => clearTimeout(wait);
	});

	const selected = $derived(communities.find((c) => c.id === value));
	const label = $derived(
		value === 'none'
			? 'no community'
			: value === 'create-new'
				? 'create new community'
				: selected?.display_name || picked || 'select a community'
	);

	function pick(v: string, name = '') {
		value = v;
		picked = name;
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
		<span class="ml-2 text-mute">▾</span>
	</button>
	{#if open}
		<div
			class="absolute z-20 mt-1 w-full overflow-hidden rounded-[10px] border border-line bg-base-2"
		>
			<input
				class="field rounded-none border-0 border-b border-line"
				placeholder="search communities..."
				bind:value={term}
			/>
			<div class="max-h-56 overflow-y-auto py-1">
				<button
					type="button"
					class="flex w-full items-center px-3 py-2 text-sm hover:bg-ember-soft"
					onclick={() => pick('none')}
				>
					<span class={cn('mr-2 w-3', value === 'none' ? 'text-ember' : 'opacity-0')}>✓</span> no community
				</button>
				<button
					type="button"
					class="flex w-full items-center px-3 py-2 text-sm hover:bg-ember-soft"
					onclick={() => pick('create-new')}
				>
					<span class={cn('mr-2 w-3', value === 'create-new' ? 'text-ember' : 'opacity-0')}>✓</span>
					create new community
				</button>
				{#each communities as c (c.id)}
					<button
						type="button"
						class="flex w-full items-center px-3 py-2 text-sm hover:bg-ember-soft"
						onclick={() => pick(c.id, c.display_name)}
					>
						<span class={cn('mr-2 w-3', value === c.id ? 'text-ember' : 'opacity-0')}>✓</span>
						{c.display_name}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
