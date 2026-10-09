<script lang="ts">
	import Avatar from '$components/Avatar.svelte';
	import UserAnimationsGrid from '$components/UserAnimationsGrid.svelte';

	let { data } = $props();
	const p = $derived(data.p);
</script>

<svelte:head>
	<title>{p.display_name || p.username} · animators hive hub</title>
</svelte:head>

<div class="wrap py-8">
	<div class="mb-8 flex items-start gap-6">
		<Avatar src={p.avatar_url} name={p.username} class="h-24 w-24" />
		<div class="space-y-2">
			<p class="eyebrow">animator</p>
			<h1 class="h1">{p.display_name || p.username}</h1>
			<p class="text-mute">@{p.username}</p>
			{#if p.bio}<p class="text-ink-soft">{p.bio}</p>{/if}
			<div class="flex flex-wrap gap-x-4 text-sm text-mute">
				{#if p.location}<span>{p.location}</span>{/if}
				{#if p.website_url}
					<a
						href={p.website_url}
						target="_blank"
						rel="nofollow noopener noreferrer external"
						class="text-ember hover:text-ink">{p.website_url.replace(/^https?:\/\//, '')}</a
					>
				{/if}
				<span>member since {new Date(p.created_at).toLocaleDateString()}</span>
			</div>
		</div>
	</div>
	<p class="eyebrow mb-4">animations</p>
	<UserAnimationsGrid items={data.a} author_id={p.id} />
</div>
