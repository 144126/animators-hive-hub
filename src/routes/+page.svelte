<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import LandingPage from '$components/LandingPage.svelte';
	import DiscoverFeed from '$components/DiscoverFeed.svelte';
	import AddAnimationModal from '$components/AddAnimationModal.svelte';

	let { data } = $props();
	const a = auth();
</script>

<svelte:head>
	<title>discover · animators hive hub</title>
</svelte:head>

{#if !a.user}
	<LandingPage />
{:else}
	<div class="wrap py-8">
		<div class="mb-8 flex items-start justify-between gap-4">
			<div>
				<p class="eyebrow mb-3">feed</p>
				<h1 class="h1 mb-2">discover</h1>
				<p class="text-ink-soft">new work from the hive</p>
			</div>
			<AddAnimationModal />
		</div>
		<DiscoverFeed items={data.a} sort={data.s} q={data.q} />
	</div>
{/if}
