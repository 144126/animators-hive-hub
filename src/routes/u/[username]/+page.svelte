<script lang="ts">
	import Avatar from '$components/Avatar.svelte';
	import UserAnimationsGrid from '$components/UserAnimationsGrid.svelte';

	let { data } = $props();
	const p = $derived(data.p);
</script>

<svelte:head>
	<title>{p.display_name || p.username} · animators hive hub</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-start space-x-6">
		<Avatar src={p.avatar_url} name={p.username} class="h-24 w-24" />
		<div class="space-y-2">
			<h1 class="text-3xl font-bold">{p.display_name || p.username}</h1>
			<p class="text-muted-foreground">@{p.username}</p>
			{#if p.bio}<p class="text-lg text-muted-foreground">{p.bio}</p>{/if}
			<div class="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
				{#if p.location}<span>{p.location}</span>{/if}
				{#if p.website_url}
					<a
						href={p.website_url}
						target="_blank"
						rel="nofollow noopener noreferrer external"
						class="text-primary hover:underline">{p.website_url.replace(/^https?:\/\//, '')}</a
					>
				{/if}
				<span>member since {new Date(p.created_at).toLocaleDateString()}</span>
			</div>
		</div>
	</div>
	<h2 class="mb-4 text-lg font-semibold">animations</h2>
	<UserAnimationsGrid items={data.a} author_id={p.id} />
</div>
