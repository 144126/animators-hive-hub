<script lang="ts">
	import { resolve } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { create_playlist } from '$lib/data';
	import type { Playlist } from '$lib/types';
	import Modal from './Modal.svelte';
	import { list_desc_max, list_name_max } from '$lib/rules';

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
			toast('playlist created');
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
			<p class="eyebrow mb-2">yours</p>
			<h2 class="font-medium">your playlists</h2>
		</div>
		<button class="btn" type="button" onclick={() => (open = true)}>create playlist</button>
	</div>
	<div class="p-6 pt-0">
		{#if playlists.length}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each playlists as p (p.id)}
					<div class="card flex flex-col p-4">
						<h3 class="line-clamp-2 font-medium">{p.name}</h3>
						<p class="mb-4 line-clamp-3 min-h-[60px] text-sm text-ink-soft">
							{p.description || 'no description'}
						</p>
						<a
							class="btn-outline w-full"
							href={resolve('/playlist/[playlistId]', { playlistId: p.id })}>view playlist</a
						>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-16 text-center text-mute">no playlists yet</div>
		{/if}
	</div>
</div>

<Modal bind:open title="create a new playlist">
	<p class="mb-4 text-sm text-ink-soft">give your playlist a name and an optional description.</p>
	<form onsubmit={create} class="space-y-4">
		<div class="space-y-2">
			<label class="text-sm" for="pname">name</label>
			<input
				id="pname"
				class="field"
				bind:value={name}
				placeholder="e.g., epic fights"
				required
				maxlength={list_name_max}
			/>
		</div>
		<div class="space-y-2">
			<label class="text-sm" for="pdesc">description (optional)</label>
			<textarea id="pdesc" class="area" bind:value={description} maxlength={list_desc_max}
			></textarea>
		</div>
		<div class="flex justify-end gap-2">
			<button class="btn-ghost" type="button" onclick={() => (open = false)}>cancel</button>
			<button class="btn" type="submit" disabled={busy}>{busy ? 'creating...' : 'create'}</button>
		</div>
	</form>
</Modal>
