<script lang="ts">
	import { Loader2 } from '@lucide/svelte';
	import { list_communities } from '$lib/data';
	import Avatar from '$components/Avatar.svelte';

	let communities = $state<Awaited<ReturnType<typeof list_communities>>>([]);
	let loading = $state(true);

	$effect(() => {
		list_communities()
			.then((d) => (communities = d))
			.finally(() => (loading = false));
	});
</script>

{#if loading}
	<div class="flex h-[calc(100vh-3.5rem)] items-center justify-center">
		<Loader2 class="h-8 w-8 animate-spin" />
	</div>
{:else}
	<div class="container mx-auto p-4 sm:p-6">
		<h1 class="mb-6 text-3xl font-bold">communities</h1>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each communities as c (c.name)}
				<a href="/c/{c.name}" class="card block h-full p-4 hover:shadow-lg">
					<div class="mb-2 flex items-center space-x-4">
						<Avatar src={c.avatar_url} name={c.display_name} class="h-12 w-12" />
						<div>
							<h2 class="text-lg font-semibold">{c.display_name}</h2>
							<p class="text-sm text-muted-foreground">{c.member_count || 0} members</p>
						</div>
					</div>
					<p class="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
				</a>
			{/each}
		</div>
	</div>
{/if}
