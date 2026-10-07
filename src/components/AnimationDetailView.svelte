<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowLeft, Play, MessageCircle } from '@lucide/svelte';
	import type { Animation, Comment } from '$lib/types';
	import { goto, invalidateAll } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { delete_animation, update_animation } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import Avatar from './Avatar.svelte';
	import CommentsSection from './CommentsSection.svelte';
	import UpvoteButton from './UpvoteButton.svelte';

	let { animation, comments }: { animation: Animation; comments: Comment[] } = $props();
	const a = auth();
	const mine = $derived(!!a.user && a.user.id === animation.author_id);
	let editing = $state(false);
	let title = $state('');
	let description = $state('');
	let busy = $state(false);

	function start_edit() {
		title = animation.title;
		description = animation.description || '';
		editing = true;
	}

	async function save(e: Event) {
		e.preventDefault();
		busy = true;
		try {
			await update_animation(animation.id, title.trim(), description.trim() || null);
			await invalidateAll();
			editing = false;
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'save failed', 'err');
		} finally {
			busy = false;
		}
	}

	async function remove() {
		if (!confirm('delete this animation for good?')) return;
		busy = true;
		try {
			await delete_animation(animation.id);
			toast('animation deleted');
			await goto(resolve('/u/[username]', { username: animation.author.username }));
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'delete failed', 'err');
			busy = false;
		}
	}
</script>

<div class="min-h-screen bg-background">
	<div class="container mx-auto max-w-4xl px-4 py-6">
		<button class="btn-ghost mb-6" type="button" onclick={() => history.back()}>
			<ArrowLeft class="mr-2 h-4 w-4" /> back
		</button>
		<div class="space-y-6">
			<div class="card overflow-hidden">
				<div class="relative aspect-video bg-black">
					{#if animation.video_url}
						<video
							src={animation.video_url}
							poster={animation.thumbnail_url || undefined}
							controls
							class="h-full w-full"
						>
							<track kind="captions" />
						</video>
					{:else if animation.thumbnail_url}
						<img
							src={animation.thumbnail_url}
							alt={animation.title}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div
							class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10"
						>
							<Play class="h-16 w-16 text-primary/50" />
						</div>
					{/if}
				</div>
			</div>
			<div class="space-y-4">
				{#if editing}
					<form onsubmit={save} class="space-y-3">
						<input class="field" bind:value={title} required maxlength="100" aria-label="title" />
						<textarea
							class="area"
							rows="3"
							bind:value={description}
							maxlength="2000"
							aria-label="description"
						></textarea>
						<div class="flex gap-2">
							<button class="btn-sm" type="submit" disabled={busy || !title.trim()}>save</button>
							<button class="btn-outline-sm" type="button" onclick={() => (editing = false)}
								>cancel</button
							>
						</div>
					</form>
				{:else}
					<h1 class="text-3xl font-bold">{animation.title}</h1>
				{/if}
				{#if mine && !editing}
					<div class="flex gap-2">
						<button class="btn-outline-sm" type="button" onclick={start_edit}>edit</button>
						<button class="btn-outline-sm" type="button" onclick={remove} disabled={busy}
							>delete</button
						>
					</div>
				{/if}
				<div class="flex items-center justify-between">
					<a
						href={resolve('/u/[username]', { username: animation.author.username })}
						class="flex items-center space-x-3 hover:underline"
					>
						<Avatar
							src={animation.author.avatar_url}
							name={animation.author.username}
							class="h-10 w-10"
						/>
						<div>
							<p class="font-medium">
								{animation.author.display_name || animation.author.username}
							</p>
							<p class="text-sm text-muted-foreground">@{animation.author.username}</p>
						</div>
					</a>
					{#if animation.community}
						<span class="rounded-full bg-secondary px-2 py-0.5 text-sm"
							>{animation.community.display_name}</span
						>
					{/if}
				</div>
				<div class="flex items-center space-x-6">
					<UpvoteButton
						post_id={animation.id}
						count={animation.upvote_count}
						voted={animation.voted}
					/>
					<div class="flex items-center space-x-1 text-muted-foreground">
						<MessageCircle class="h-4 w-4" />
						<span>{animation.comment_count} comments</span>
					</div>
					<span class="text-sm text-muted-foreground"
						>{new Date(animation.created_at).toLocaleDateString()}</span
					>
				</div>
				{#if animation.description}
					<div class="card p-6">
						<h3 class="mb-3 font-semibold">description</h3>
						<p class="whitespace-pre-wrap text-muted-foreground">{animation.description}</p>
					</div>
				{/if}
			</div>
			<CommentsSection post_id={animation.id} {comments} />
		</div>
	</div>
</div>
