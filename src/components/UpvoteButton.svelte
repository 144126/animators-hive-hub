<script lang="ts">
	import { ArrowUp } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { set_upvote } from '$lib/data';
	import { cn } from '$lib/utils';

	let {
		post_id,
		count,
		voted: initial = false,
		variant = 'default'
	}: {
		post_id: string;
		count: number;
		voted?: boolean;
		variant?: 'default' | 'minimal';
	} = $props();

	const a = auth();
	let voted = $derived(initial);
	let busy = $state(false);
	let n = $derived(count);

	async function toggle(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (!a.user) {
			toast('error', 'please sign in to upvote posts', 'err');
			return;
		}
		busy = true;
		try {
			await set_upvote(post_id, !voted);
			if (voted) {
				voted = false;
				n = Math.max(0, n - 1);
				toast('upvote removed');
			} else {
				voted = true;
				n += 1;
				toast('post upvoted!');
			}
		} catch {
			toast('error', 'failed to upvote post', 'err');
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
		variant === 'minimal' ? 'btn-ghost-sm space-x-1' : 'btn-outline-sm space-x-2',
		voted && variant === 'minimal' && 'text-orange-500',
		voted &&
			variant !== 'minimal' &&
			'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
	)}
>
	<ArrowUp class={cn('h-4 w-4', voted && 'fill-current')} />
	<span>{n}</span>
</button>
