<script lang="ts">
	import { resolve } from '$app/paths';
	import { Edit } from '@lucide/svelte';
	import { auth, display_name } from '$lib/auth.svelte';
	import Avatar from '$components/Avatar.svelte';
	import AddAnimationModal from '$components/AddAnimationModal.svelte';
	import UserAnimationsGrid from '$components/UserAnimationsGrid.svelte';
	import PlaylistsTab from '$components/PlaylistsTab.svelte';

	let { data } = $props();
	const a = auth();
	let tab = $state<'animations' | 'playlists'>('animations');
	const name = $derived(display_name(a.user));
	const bio = $derived(a.user?.user_metadata?.bio || 'no bio available yet.');
</script>

{#if !a.user}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="mb-4 text-muted-foreground">please sign in to view your profile.</p>
			<a class="btn" href={resolve('/')}>go to homepage</a>
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8 flex items-start space-x-6">
			<Avatar src={a.user.user_metadata?.avatar_url} {name} class="h-24 w-24" />
			<div class="flex-1">
				<div class="mb-4 flex items-start justify-between">
					<div>
						<h1 class="mb-2 text-3xl font-bold">{name}</h1>
						<p class="mb-4 text-lg text-muted-foreground">{bio}</p>
						<p class="text-sm text-muted-foreground">
							member since {new Date(a.user.created_at).toLocaleDateString()}
						</p>
					</div>
					<a class="btn-outline" href={resolve('/profile/edit')}
						><Edit class="mr-2 h-4 w-4" /> edit profile</a
					>
				</div>
			</div>
		</div>
		<div class="grid w-full grid-cols-2 rounded-md bg-muted p-1">
			<button
				class="rounded px-3 py-1.5 text-sm {tab === 'animations' ? 'bg-background shadow' : ''}"
				type="button"
				onclick={() => (tab = 'animations')}>animations</button
			>
			<button
				class="rounded px-3 py-1.5 text-sm {tab === 'playlists' ? 'bg-background shadow' : ''}"
				type="button"
				onclick={() => (tab = 'playlists')}>playlists</button
			>
		</div>
		<div class="mt-6">
			{#if tab === 'animations'}
				<div class="card">
					<div class="flex items-center justify-between p-6">
						<div>
							<h2 class="text-lg font-semibold">your animations</h2>
							<p class="text-sm text-muted-foreground">
								animations you've shared with the community
							</p>
						</div>
						<AddAnimationModal />
					</div>
					<div class="p-6 pt-0"><UserAnimationsGrid items={data.a} /></div>
				</div>
			{:else}
				<PlaylistsTab playlists={data.l} />
			{/if}
		</div>
	</div>
{/if}
