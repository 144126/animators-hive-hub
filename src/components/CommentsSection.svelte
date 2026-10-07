<script lang="ts">
	import { resolve } from '$app/paths';
	import { MessageCircle, Send } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import { post_comment } from '$lib/data';
	import type { Comment } from '$lib/types';
	import Avatar from './Avatar.svelte';

	let { post_id, comments }: { post_id: string; comments: Comment[] } = $props();
	const a = auth();
	let text = $state('');
	let busy = $state(false);

	async function submit(e: Event) {
		e.preventDefault();
		if (!a.user || !text.trim()) return;
		busy = true;
		try {
			await post_comment(post_id, text.trim());
			text = '';
			toast('comment posted!');
			await invalidateAll();
		} catch {
			toast('error', 'failed to post comment', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<div class="card">
	<div class="flex items-center space-x-2 border-b p-6 text-lg font-semibold">
		<MessageCircle class="h-5 w-5" />
		<span>comments ({comments.length})</span>
	</div>
	<div class="space-y-6 p-6">
		{#if a.user}
			<form onsubmit={submit} class="space-y-4">
				<textarea class="area min-h-[100px]" placeholder="write a comment..." bind:value={text}
				></textarea>
				<div class="flex justify-end">
					<button class="btn-sm" type="submit" disabled={!text.trim() || busy}>
						<Send class="mr-2 h-4 w-4" />
						{busy ? 'posting...' : 'post comment'}
					</button>
				</div>
			</form>
		{:else}
			<div class="py-6 text-center text-muted-foreground">please log in to leave a comment</div>
		{/if}
		<div class="space-y-4">
			{#if comments.length}
				{#each comments as c (c.id)}
					<div class="space-y-2 border-l-2 border-muted pl-4">
						<div class="flex items-center space-x-2">
							<a
								href={resolve('/u/[username]', { username: c.author.username })}
								class="flex items-center space-x-2 hover:underline"
							>
								<Avatar src={c.author.avatar_url} name={c.author.username} class="h-6 w-6" />
								<span class="text-sm font-medium">{c.author.display_name || c.author.username}</span
								>
							</a>
							<span class="text-xs text-muted-foreground"
								>{new Date(c.created_at).toLocaleDateString()}</span
							>
						</div>
						<p class="pl-8 text-sm">{c.content}</p>
					</div>
				{/each}
			{:else}
				<div class="py-6 text-center text-muted-foreground">
					no comments yet. be the first to comment!
				</div>
			{/if}
		</div>
	</div>
</div>
