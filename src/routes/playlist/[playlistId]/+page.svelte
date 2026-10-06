<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft, ListMusic } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { get_playlist, playlist_items } from '$lib/data';
	import type { Animation, Playlist } from '$lib/types';
	import AnimationCard from '$components/AnimationCard.svelte';

	const a = auth();
	let playlist = $state<(Playlist & { user_id: string; created_at: string }) | null>(null);
	let items = $state<{ id: string; animations: Animation | null }[]>([]);
	let loading = $state(true);
	let err = $state(false);

	$effect(() => {
		const id = page.params.playlistId;
		if (!id) return;
		loading = true;
		Promise.all([get_playlist(id), playlist_items(id)])
			.then(([p, rows]) => {
				playlist = p;
				items = rows;
			})
			.catch(() => (err = true))
			.finally(() => (loading = false));
	});

	const owner = $derived(!!a.user && !!playlist && a.user.id === playlist.user_id);
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
	</div>
{:else if err || !playlist}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="mb-4 text-muted-foreground">playlist not found.</p>
			<a class="btn" href="/profile">back to profile</a>
		</div>
	</div>
{:else}
	<main class="container mx-auto px-4 py-8">
		<div class="mb-8 flex items-center space-x-4">
			<a class="btn-icon" href="/profile"><ArrowLeft class="h-5 w-5" /></a>
			<ListMusic class="h-8 w-8 text-primary" />
			<h1 class="text-2xl font-bold">playlist</h1>
		</div>
		<div class="mb-8">
			<h1 class="mb-4 text-4xl font-bold">{playlist.name}</h1>
			{#if playlist.description}<p class="mb-4 text-lg text-muted-foreground">{playlist.description}</p>{/if}
			<p class="text-sm text-muted-foreground">created {new Date(playlist.created_at).toLocaleDateString()} · {items.length} animations</p>
		</div>
		<div class="card p-6">
			<h2 class="text-lg font-semibold">animations</h2>
			<p class="mb-4 text-sm text-muted-foreground">{owner ? 'your saved animations' : 'animations in this playlist'}</p>
			{#if items.filter((i) => i.animations).length}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each items as item (item.id)}
						{#if item.animations}<AnimationCard animation={item.animations} />{/if}
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center">
					<ListMusic class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<p class="text-muted-foreground">no animations in this playlist yet</p>
				</div>
			{/if}
		</div>
	</main>
{/if}
