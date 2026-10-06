<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import LandingPage from '$components/LandingPage.svelte';
	import DiscoverFeed from '$components/DiscoverFeed.svelte';

	const a = auth();
</script>

{#if a.loading}
	<div class="flex min-h-screen items-center justify-center bg-background">
		<div class="text-center">
			<div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
			<p class="text-muted-foreground">loading...</p>
		</div>
	</div>
{:else if !a.user}
	<LandingPage />
{:else}
	<div class="min-h-screen bg-background">
		<div class="container mx-auto px-4 py-8">
			<div class="mb-8">
				<h2 class="mb-2 text-3xl font-bold">discover</h2>
				<p class="text-muted-foreground">explore amazing animations from our community</p>
			</div>
			<DiscoverFeed />
		</div>
	</div>
{/if}
