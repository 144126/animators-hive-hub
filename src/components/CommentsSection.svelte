<script lang="ts">
	import { resolve } from '$app/paths';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import { delete_comment, post_comment } from '$lib/data';
	import type { Comment } from '$lib/types';
	import { comment_max } from '$lib/rules';
	import Avatar from './Avatar.svelte';

	let { post_id, comments }: { post_id: string; comments: Comment[] } = $props();
	const a = auth();
	let text = $state('');
	let busy = $state(false);

	async function remove(id: string) {
		try {
			await delete_comment(id);
			await invalidateAll();
		} catch {
			toast('error', 'failed to delete comment', 'err');
		}
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!a.user || !text.trim()) return;
		busy = true;
		try {
			await post_comment(post_id, text.trim());
			text = '';
			await invalidateAll();
		} catch {
			toast('error', 'failed to post comment', 'err');
		} finally {
			busy = false;
		}
	}
</script>

<div class="card">
	<div class="border-b border-line p-6">
		<p class="eyebrow">comments ({comments.length})</p>
	</div>
	<div class="space-y-6 p-6">
		{#if a.user}
			<form onsubmit={submit} class="space-y-4">
				<textarea
					class="area min-h-[100px]"
					placeholder="write a comment..."
					bind:value={text}
					maxlength={comment_max}
				></textarea>
				<div class="flex justify-end">
					<button class="btn-sm" type="submit" disabled={!text.trim() || busy}>
						{busy ? 'posting...' : 'post comment'}
					</button>
				</div>
			</form>
		{:else}
			<div class="py-6 text-center text-mute">sign in to leave a comment</div>
		{/if}
		<div class="space-y-4">
			{#if comments.length}
				{#each comments as c (c.id)}
					<div class="space-y-2 border-l border-line pl-4">
						<div class="flex items-center gap-2">
							<a
								href={resolve('/u/[username]', { username: c.author.username })}
								class="flex items-center gap-2 hover:text-ink"
							>
								<Avatar src={c.author.avatar_url} name={c.author.username} class="h-6 w-6" />
								<span class="text-sm font-medium">{c.author.display_name || c.author.username}</span
								>
							</a>
							<span class="text-xs text-mute">{new Date(c.created_at).toLocaleDateString()}</span>
							{#if a.user && a.user.id === c.author_id}
								<button
									class="btn-icon ml-auto h-6 w-6"
									type="button"
									aria-label="delete comment"
									onclick={() => remove(c.id)}>×</button
								>
							{/if}
						</div>
						<p class="pl-8 text-sm">{c.content}</p>
					</div>
				{/each}
			{:else}
				<div class="py-6 text-center text-mute">no comments yet</div>
			{/if}
		</div>
	</div>
</div>
