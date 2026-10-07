<script lang="ts">
	import { Plus, Loader2 } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { add_to_playlist, user_playlists } from '$lib/data';
	import type { Playlist } from '$lib/types';
	import Modal from './Modal.svelte';

	let { animation_id, title }: { animation_id: string; title: string } = $props();
	const a = auth();
	let open = $state(false);
	let loading = $state(false);
	let busy = $state(false);
	let playlists = $state<Playlist[]>([]);

	async function load() {
		if (!a.user) return;
		loading = true;
		try {
			playlists = await user_playlists(a.user.id);
		} catch (e) {
			toast('error', e instanceof Error ? e.message : 'failed', 'err');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (open) load();
	});

	async function add(id: string) {
		if (!a.user) return;
		busy = true;
		try {
			await add_to_playlist(id, animation_id);
			const p = playlists.find((x) => x.id === id);
			toast('added to playlist!', `"${title}" was added to "${p?.name}"`);
			open = false;
		} catch (e) {
			const msg = e instanceof Error ? e.message : '';
			if (msg.includes('duplicate key value'))
				toast('already in playlist', 'this animation is already in that playlist', 'err');
			else toast('failed to add to playlist', msg, 'err');
		} finally {
			busy = false;
		}
	}
</script>

{#if a.user}
	<button class="btn-outline-sm" type="button" onclick={() => (open = true)}>
		<Plus class="mr-2 h-4 w-4" /> add to playlist
	</button>
	<Modal bind:open title="add to playlist">
		<p class="mb-4 text-sm text-muted-foreground">choose a playlist to add "{title}" to</p>
		{#if loading}
			<div class="flex justify-center py-8"><Loader2 class="h-6 w-6 animate-spin" /></div>
		{:else if playlists.length}
			<div class="max-h-60 space-y-2 overflow-y-auto">
				{#each playlists as p (p.id)}
					<button
						class="btn-ghost h-auto w-full justify-start p-4"
						type="button"
						disabled={busy}
						onclick={() => add(p.id)}
					>
						<div class="text-left">
							<div class="font-medium">{p.name}</div>
							{#if p.description}<div class="line-clamp-2 text-sm text-muted-foreground">
									{p.description}
								</div>{/if}
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<div class="py-8 text-center text-muted-foreground">
				<p class="mb-2">you don't have any playlists yet</p>
				<p class="text-sm">create a playlist first to save animations</p>
			</div>
		{/if}
	</Modal>
{/if}
