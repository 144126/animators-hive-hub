<script lang="ts">
	import Avatar from '$components/Avatar.svelte';
	import DiscoverFeed from '$components/DiscoverFeed.svelte';

	let { data } = $props();
</script>

<div class="container mx-auto p-4 sm:p-6">
	<div class="mb-6 flex items-end">
		<Avatar src={data.c.avatar_url} name={data.c.display_name} class="h-24 w-24 md:h-32 md:w-32" />
		<div class="mb-2 ml-4">
			<h1 class="text-2xl font-bold md:text-3xl">{data.c.display_name}</h1>
			{#if data.c.description}
				<p class="text-sm text-muted-foreground md:text-base">{data.c.description}</p>
			{/if}
		</div>
	</div>
	<DiscoverFeed items={data.a} sort={data.s} community_id={data.c.id} />
</div>
