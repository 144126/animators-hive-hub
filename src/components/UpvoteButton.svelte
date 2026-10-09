<script lang="ts">
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { set_upvote } from '$lib/data';
	import { cn } from '$lib/utils';

	let {
		post_id,
		count,
		voted: initial = false
	}: {
		post_id: string;
		count: number;
		voted?: boolean;
	} = $props();

	const a = auth();
	let voted = $state(false);
	let n = $state(0);
	let busy = $state(false);

	$effect(() => {
		voted = initial;
		n = count;
	});

	async function toggle(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (!a.user) {
			toast('error', 'sign in to upvote', 'err');
			return;
		}
		busy = true;
		const next = !voted;
		try {
			await set_upvote(post_id, next);
			voted = next;
			n = Math.max(0, n + (next ? 1 : -1));
		} catch {
			toast('error', 'failed to upvote', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<button
	type="button"
	onclick={toggle}
	disabled={busy}
	class={cn(
		'btn-outline-sm',
		voted && 'border-ember bg-ember text-ember-ink hover:border-[#e79a6c] hover:bg-[#e79a6c]'
	)}
>
	<span>{n}</span>
</button>
