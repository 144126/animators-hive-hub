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

<svelte:head>
	<title>profile · animators hive hub</title>
</svelte:head>

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
						<div class="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
							{#if a.user.user_metadata?.location}<span>{a.user.user_metadata.location}</span>{/if}
							{#if a.user.user_metadata?.website_url}
								<a
									href={a.user.user_metadata.website_url}
									target="_blank"
									rel="nofollow noopener noreferrer external"
									class="text-primary hover:underline">{a.user.user_metadata.website_url}</a
								>
							{/if}
							<span>member since {new Date(a.user.created_at).toLocaleDateString()}</span>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<a class="btn-outline" href={resolve('/profile/edit')}
							><Edit class="mr-2 h-4 w-4" /> edit profile</a
						>
						<a
							class="btn-ghost"
							href={resolve('/u/[username]', { username: a.user.user_metadata.username })}
							>view public profile</a
						>
					</div>
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
					<div class="p-6 pt-0">
						<UserAnimationsGrid items={data.a} author_id={a.user?.id ?? ''} />
					</div>
				</div>
			{:else}
				<PlaylistsTab playlists={data.l} />
			{/if}
		</div>
	</div>
{/if}
