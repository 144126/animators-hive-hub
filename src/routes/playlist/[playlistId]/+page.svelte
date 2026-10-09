<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto, invalidateAll } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { delete_playlist, delete_playlist_item, update_playlist } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import AnimationCard from '$components/AnimationCard.svelte';
	import { list_desc_max, list_name_max } from '$lib/rules';

	let { data } = $props();
	const a = auth();
	const playlist = $derived(data.l);
	const items = $derived(data.i);
	const owner = $derived(!!a.user && a.user.id === playlist.user_id);
	let editing = $state(false);
	let name = $state('');
	let description = $state('');
	let busy = $state(false);

	function start_edit() {
		name = playlist.name;
		description = playlist.description || '';
		editing = true;
	}

	async function save(e: Event) {
		e.preventDefault();
		busy = true;
		try {
			await update_playlist(playlist.id, name.trim(), description.trim() || null);
			await invalidateAll();
			editing = false;
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'save failed', 'err');
		} finally {
			busy = false;
		}
	}

	async function remove_list() {
		if (!confirm('delete this playlist?')) return;
		busy = true;
		try {
			await delete_playlist(playlist.id);
			await goto(resolve('/profile'));
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'delete failed', 'err');
			busy = false;
		}
	}

	async function remove_item(id: string) {
		busy = true;
		try {
			await delete_playlist_item(id);
			await invalidateAll();
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'remove failed', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>{playlist.name} · animators hive hub</title>
</svelte:head>

<div class="wrap py-8">
	<div class="mb-6">
		<a class="btn-icon" href={resolve('/profile')} aria-label="back">←</a>
	</div>
	<div class="mb-8">
		{#if editing}
			<form onsubmit={save} class="space-y-3">
				<input
					class="field"
					bind:value={name}
					required
					maxlength={list_name_max}
					aria-label="name"
				/>
				<textarea
					class="area"
					rows="3"
					bind:value={description}
					maxlength={list_desc_max}
					aria-label="description"
				></textarea>
				<div class="flex gap-2">
					<button class="btn-sm" type="submit" disabled={busy || !name.trim()}>save</button>
					<button class="btn-outline-sm" type="button" onclick={() => (editing = false)}
						>cancel</button
					>
				</div>
			</form>
		{:else}
			<p class="eyebrow mb-3">playlist</p>
			<h1 class="h1 mb-4">{playlist.name}</h1>
			{#if playlist.description}<p class="mb-4 text-ink-soft">{playlist.description}</p>{/if}
		{/if}
		<p class="text-sm text-mute">
			created {new Date(playlist.created_at).toLocaleDateString()} · {items.length} animations
		</p>
		{#if owner && !editing}
			<div class="mt-4 flex gap-2">
				<button class="btn-outline-sm" type="button" onclick={start_edit}>rename</button>
				<button class="btn-outline-sm" type="button" onclick={remove_list} disabled={busy}
					>delete playlist</button
				>
			</div>
		{/if}
	</div>
	<div class="card p-6">
		<p class="eyebrow mb-4">{owner ? 'your saved animations' : 'animations in this playlist'}</p>
		{#if items.filter((i) => i.animations).length}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each items as item (item.id)}
					{#if item.animations}
						<div class="space-y-2">
							<AnimationCard animation={item.animations} />
							{#if owner}
								<button
									class="btn-outline-sm w-full"
									type="button"
									disabled={busy}
									onclick={() => remove_item(item.id)}>remove</button
								>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="py-16 text-center text-mute">no animations in this playlist yet</div>
		{/if}
	</div>
</div>
