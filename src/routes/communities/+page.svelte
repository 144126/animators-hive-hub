<script lang="ts">
	import { resolve } from '$app/paths';
	import Avatar from '$components/Avatar.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>communities · animators hive hub</title>
</svelte:head>

<div class="container mx-auto p-4 sm:p-6">
	<h1 class="mb-6 text-3xl font-bold">communities</h1>
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.c as c (c.name)}
			<a
				href={resolve('/c/[communityName]', { communityName: c.name })}
				class="card block h-full p-4 hover:shadow-lg"
			>
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
