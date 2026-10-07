<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Avatar from '$components/Avatar.svelte';
	import DiscoverFeed from '$components/DiscoverFeed.svelte';
	import { auth } from '$lib/auth.svelte';
	import { set_joined } from '$lib/data';
	import { toast } from '$lib/toast.svelte';

	let { data } = $props();
	const a = auth();
	let busy = $state(false);

	async function toggle() {
		busy = true;
		try {
			await set_joined(data.c.name, !data.c.j);
			await invalidateAll();
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'failed', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>{data.c.display_name} · animators hive hub</title>
</svelte:head>

<div class="container mx-auto p-4 sm:p-6">
	<div class="mb-6 flex items-end">
		<Avatar src={data.c.avatar_url} name={data.c.display_name} class="h-24 w-24 md:h-32 md:w-32" />
		<div class="mb-2 ml-4">
			<h1 class="text-2xl font-bold md:text-3xl">{data.c.display_name}</h1>
			{#if data.c.description}
				<p class="text-sm text-muted-foreground md:text-base">{data.c.description}</p>
			{/if}
			<p class="mt-1 text-sm text-muted-foreground">{data.c.member_count} members</p>
			{#if a.user}
				<button class="btn-outline-sm mt-2" type="button" disabled={busy} onclick={toggle}
					>{data.c.j ? 'leave' : 'join'}</button
				>
			{/if}
		</div>
	</div>
	<DiscoverFeed items={data.a} sort={data.s} community_id={data.c.id} />
</div>
