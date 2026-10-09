<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$components/Avatar.svelte';

	let { data } = $props();
	let q = $state('');
	const shown = $derived(
		q.trim()
			? data.c.filter((c) => {
					const t = q.trim().toLowerCase();
					return c.display_name.toLowerCase().includes(t) || c.name.toLowerCase().includes(t);
				})
			: data.c
	);
</script>

<svelte:head>
	<title>communities · animators hive hub</title>
</svelte:head>

<div class="wrap py-8">
	<p class="eyebrow mb-3">groups</p>
	<h1 class="h1 mb-6">communities</h1>
	<input
		class="field mb-6 max-w-sm"
		bind:value={q}
		placeholder="search communities"
		aria-label="search communities"
	/>
	{#if shown.length}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each shown as c (c.name)}
				<a
					href={resolve('/c/[communityName]', { communityName: c.name })}
					class="card block h-full p-4 transition-colors duration-300 hover:border-ember"
				>
					<div class="mb-2 flex items-center gap-4">
						<Avatar src={c.avatar_url} name={c.display_name} class="h-12 w-12" />
						<div>
							<h2 class="text-lg font-medium">{c.display_name}</h2>
							<p class="text-sm text-mute">{c.member_count || 0} members</p>
						</div>
					</div>
					{#if c.description}
						<p class="line-clamp-2 text-sm text-ink-soft">{c.description}</p>
					{/if}
				</a>
			{/each}
		</div>
	{:else}
		<p class="py-16 text-center text-mute">
			{q.trim() ? 'no communities match' : 'no communities yet'}
		</p>
	{/if}
</div>
