<script lang="ts">
	import { resolve } from '$app/paths';
	import { auth, display_name } from '$lib/auth.svelte';
	import Avatar from '$components/Avatar.svelte';
	import AddAnimationModal from '$components/AddAnimationModal.svelte';
	import UserAnimationsGrid from '$components/UserAnimationsGrid.svelte';
	import PlaylistsTab from '$components/PlaylistsTab.svelte';

	let { data } = $props();
	const a = auth();
	let tab = $state<'animations' | 'playlists'>('animations');
	const name = $derived(display_name(a.user));
	const bio = $derived(a.user?.user_metadata?.bio || '');
</script>

<svelte:head>
	<title>profile · animators hive hub</title>
</svelte:head>

{#if !a.user}
	<div class="wrap flex min-h-[60vh] items-center justify-center">
		<div class="text-center">
			<p class="mb-4 text-mute">sign in to view your profile</p>
			<a class="btn" href={resolve('/')}>go home</a>
		</div>
	</div>
{:else}
	<div class="wrap py-8">
		<div class="mb-8 flex items-start gap-6">
			<Avatar src={a.user.user_metadata?.avatar_url} {name} class="h-24 w-24" />
			<div class="min-w-0 flex-1">
				<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
					<div>
						<p class="eyebrow mb-2">you</p>
						<h1 class="h1 mb-2">{name}</h1>
						{#if bio}<p class="mb-4 text-ink-soft">{bio}</p>{/if}
						<div class="flex flex-wrap gap-x-4 text-sm text-mute">
							{#if a.user.user_metadata?.location}<span>{a.user.user_metadata.location}</span>{/if}
							{#if a.user.user_metadata?.website_url}
								<a
									href={a.user.user_metadata.website_url}
									target="_blank"
									rel="nofollow noopener noreferrer external"
									class="text-ember hover:text-ink">{a.user.user_metadata.website_url}</a
								>
							{/if}
							<span>member since {new Date(a.user.created_at).toLocaleDateString()}</span>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<a class="btn-outline" href={resolve('/profile/edit')}>edit profile</a>
						<a
							class="btn-ghost"
							href={resolve('/u/[username]', { username: a.user.user_metadata.username })}
							>view public profile</a
						>
					</div>
				</div>
			</div>
		</div>
		<div class="grid w-full grid-cols-2 rounded-full border border-line p-1">
			<button
				class="rounded-full px-3 py-1.5 text-[12px] {tab === 'animations'
					? 'bg-ink text-[#0b0b0c]'
					: 'text-mute'}"
				type="button"
				onclick={() => (tab = 'animations')}>animations</button
			>
			<button
				class="rounded-full px-3 py-1.5 text-[12px] {tab === 'playlists'
					? 'bg-ink text-[#0b0b0c]'
					: 'text-mute'}"
				type="button"
				onclick={() => (tab = 'playlists')}>playlists</button
			>
		</div>
		<div class="mt-6">
			{#if tab === 'animations'}
				<div class="card">
					<div class="flex items-center justify-between p-6">
						<div>
							<p class="eyebrow mb-2">yours</p>
							<h2 class="font-medium">your animations</h2>
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
