<script lang="ts">
	import { resolve } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import { Plus, ListMusic } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { create_playlist } from '$lib/data';
	import type { Playlist } from '$lib/types';
	import Modal from './Modal.svelte';

	const a = auth();
	let { playlists }: { playlists: Playlist[] } = $props();
	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let busy = $state(false);

	async function create(e: Event) {
		e.preventDefault();
		if (!a.user || !name.trim()) return;
		busy = true;
		try {
			await create_playlist(name.trim(), description.trim() || null);
			toast('playlist created!', 'your new playlist has been created.');
			open = false;
			name = '';
			description = '';
			await invalidateAll();
		} catch (e) {
			toast('failed to create playlist', e instanceof Error ? e.message : '', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<div class="card">
	<div class="flex items-center justify-between p-6">
		<div>
			<h2 class="text-lg font-semibold">your playlists</h2>
			<p class="text-sm text-muted-foreground">collections of animations you've saved</p>
		</div>
		<button class="btn" type="button" onclick={() => (open = true)}
			><Plus class="mr-2 h-4 w-4" /> create playlist</button
		>
	</div>
	<div class="p-6 pt-0">
		{#if playlists.length}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each playlists as p (p.id)}
					<div class="card flex flex-col p-4">
						<h3 class="line-clamp-2 font-semibold">{p.name}</h3>
						<p class="mb-4 line-clamp-3 min-h-[60px] text-sm text-muted-foreground">
							{p.description || 'no description.'}
						</p>
						<a
							class="btn-outline w-full"
							href={resolve('/playlist/[playlistId]', { playlistId: p.id })}>view playlist</a
						>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center">
				<ListMusic class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<p class="text-muted-foreground">no playlists yet</p>
				<p class="mt-2 text-sm text-muted-foreground">
					create playlists to organize your favorite animations!
				</p>
			</div>
		{/if}
	</div>
</div>

<Modal bind:open title="create a new playlist">
	<p class="mb-4 text-sm text-muted-foreground">
		give your playlist a name and an optional description.
	</p>
	<form onsubmit={create} class="space-y-4">
		<div class="space-y-2">
			<label class="text-sm font-medium" for="pname">name</label>
			<input
				id="pname"
				class="field"
				bind:value={name}
				placeholder="e.g., epic fights"
				required
				maxlength="100"
			/>
		</div>
		<div class="space-y-2">
			<label class="text-sm font-medium" for="pdesc">description (optional)</label>
			<textarea id="pdesc" class="area" bind:value={description} maxlength="500"></textarea>
		</div>
		<div class="flex justify-end gap-2">
			<button class="btn-ghost" type="button" onclick={() => (open = false)}>cancel</button>
			<button class="btn" type="submit" disabled={busy}>{busy ? 'creating...' : 'create'}</button>
		</div>
	</form>
</Modal>
