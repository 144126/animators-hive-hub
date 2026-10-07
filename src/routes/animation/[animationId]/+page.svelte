<script lang="ts">
	import { page } from '$app/state';
	import AnimationDetailView from '$components/AnimationDetailView.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.a.title} · animators hive hub</title>
	<meta
		name="description"
		content={data.a.description || `${data.a.title} by @${data.a.author.username}`}
	/>
	<meta property="og:title" content={data.a.title} />
	{#if data.a.thumbnail_url}
		<meta property="og:image" content={new URL(data.a.thumbnail_url, page.url).href} />
	{/if}
</svelte:head>

<AnimationDetailView animation={data.a} comments={data.n} />
