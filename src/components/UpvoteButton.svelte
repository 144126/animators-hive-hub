<script lang="ts">
	import { ArrowUp } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { supabase } from '$lib/supabase';
	import { toast } from '$lib/toast.svelte';
	import { has_upvote } from '$lib/data';
	import { cn } from '$lib/utils';

	let {
		post_id,
		count,
		variant = 'default'
	}: { post_id: string; count: number; variant?: 'default' | 'minimal' } = $props();

	const a = auth();
	let voted = $state(false);
	let busy = $state(false);
	let n = $state(count);

	$effect(() => {
		n = count;
	});

	$effect(() => {
		const uid = a.user?.id;
		if (!uid) {
			voted = false;
			return;
		}
		has_upvote(uid, post_id).then((v) => (voted = v));
	});

	async function toggle(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		if (!a.user) {
			toast('error', 'please sign in to upvote posts', 'err');
			return;
		}
		busy = true;
		try {
			if (voted) {
				const { error } = await supabase.from('upvotes').delete().eq('post_id', post_id).eq('user_id', a.user.id);
				if (error) throw error;
				voted = false;
				n = Math.max(0, n - 1);
				toast('upvote removed');
			} else {
				const { error } = await supabase.from('upvotes').insert({ user_id: a.user.id, post_id });
				if (error) throw error;
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
		voted && variant !== 'minimal' && 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
	)}
>
	<ArrowUp class={cn('h-4 w-4', voted && 'fill-current')} />
	<span>{n}</span>
</button>
