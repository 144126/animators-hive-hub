<script lang="ts">
	import { page } from '$app/state';
	import { get_animation } from '$lib/data';
	import type { Animation } from '$lib/types';
	import AnimationDetailView from '$components/AnimationDetailView.svelte';

	let animation = $state<Animation | null>(null);
	let loading = $state(true);
	let err = $state(false);

	$effect(() => {
		const id = page.params.animationId;
		if (!id) return;
		loading = true;
		get_animation(id)
			.then((d) => (animation = d))
			.catch(() => (err = true))
			.finally(() => (loading = false));
	});
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
	</div>
{:else if err || !animation}
	<div class="flex min-h-screen items-center justify-center text-muted-foreground">animation not found</div>
{:else}
	<AnimationDetailView {animation} />
{/if}
