<script lang="ts">
	import { page } from '$app/state';
	import { Loader2 } from '@lucide/svelte';
	import { get_community } from '$lib/data';
	import Avatar from '$components/Avatar.svelte';
	import DiscoverFeed from '$components/DiscoverFeed.svelte';

	let community = $state<Awaited<ReturnType<typeof get_community>>>(null);
	let loading = $state(true);

	$effect(() => {
		const name = page.params.communityName;
		if (!name) return;
		loading = true;
		get_community(name)
			.then((d) => (community = d))
			.finally(() => (loading = false));
	});
</script>

{#if loading}
	<div class="flex h-screen items-center justify-center"><Loader2 class="h-8 w-8 animate-spin" /></div>
{:else if !community}
	<div class="py-12 text-center text-muted-foreground">community not found.</div>
{:else}
	<div>
		{#if community.banner_url}
			<div class="h-32 bg-cover bg-center md:h-48" style="background-image: url({community.banner_url})"></div>
		{/if}
		<div class="container mx-auto p-4 sm:p-6">
			<div class="-mt-12 mb-6 flex items-end md:-mt-16">
				<Avatar src={community.avatar_url} name={community.display_name} class="h-24 w-24 border-4 border-background md:h-32 md:w-32" />
				<div class="mb-2 ml-4">
					<h1 class="text-2xl font-bold md:text-3xl">{community.display_name}</h1>
					<p class="text-sm text-muted-foreground md:text-base">{community.description}</p>
				</div>
			</div>
			<DiscoverFeed community_id={community.id} />
		</div>
	</div>
{/if}
