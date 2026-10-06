<script lang="ts">
	import { page } from '$app/state';
	import { Loader2 } from '@lucide/svelte';
	import { get_post } from '$lib/data';
	import type { Post } from '$lib/types';
	import PostDetailView from '$components/PostDetailView.svelte';

	let post = $state<Post | null>(null);
	let loading = $state(true);
	let err = $state('');

	$effect(() => {
		const id = page.params.postId;
		if (!id) return;
		loading = true;
		get_post(id)
			.then((p) => (post = p))
			.catch((e) => (err = e instanceof Error ? e.message : 'unknown error'))
			.finally(() => (loading = false));
	});
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<Loader2 class="h-8 w-8 animate-spin" />
	</div>
{:else if err}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="text-muted-foreground">failed to load animation</p>
			<p class="mt-2 text-sm text-muted-foreground">{err}</p>
		</div>
	</div>
{:else if post}
	<PostDetailView {post} />
{:else}
	<div class="flex min-h-screen items-center justify-center text-muted-foreground">animation not found</div>
{/if}
