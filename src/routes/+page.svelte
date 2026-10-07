<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import LandingPage from '$components/LandingPage.svelte';
	import DiscoverFeed from '$components/DiscoverFeed.svelte';
	import AddAnimationModal from '$components/AddAnimationModal.svelte';

	let { data } = $props();
	const a = auth();
</script>

{#if !a.user}
	<LandingPage />
{:else}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-8">
			<div class="mb-8 flex items-start justify-between gap-4">
				<div>
					<h2 class="mb-2 text-3xl font-bold">discover</h2>
					<p class="text-muted-foreground">explore amazing animations from our community</p>
				</div>
				<AddAnimationModal />
			</div>
			<DiscoverFeed items={data.a} sort={data.s} />
		</div>
	</div>
{/if}
