<script lang="ts">
	import { ArrowLeft, Play, MessageCircle } from '@lucide/svelte';
	import type { Animation } from '$lib/types';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { has_animation_upvote, set_upvote } from '$lib/data';
	import { cn } from '$lib/utils';
	import Avatar from './Avatar.svelte';
	import CommentsSection from './CommentsSection.svelte';

	let { animation }: { animation: Animation } = $props();
	const a = auth();
	let voted = $state(false);
	let busy = $state(false);
	let n = $state(animation.upvote_count);

	$effect(() => {
		const uid = a.user?.id;
		if (!uid) {
			voted = false;
			return;
		}
		has_animation_upvote(uid, animation.id).then((v) => (voted = v));
	});

	async function toggle() {
		if (!a.user) return toast('error', 'please sign in to upvote animations', 'err');
		busy = true;
		try {
			await set_upvote(animation.id, !voted);
			if (voted) {
				voted = false;
				n = Math.max(0, n - 1);
				toast('upvote removed');
			} else {
				voted = true;
				n += 1;
				toast('animation upvoted!');
			}
		} catch {
			toast('error', 'failed to upvote animation', 'err');
		} finally {
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
						<video src={animation.video_url} poster={animation.thumbnail_url || undefined} controls class="h-full w-full">
							<track kind="captions" />
						</video>
					{:else if animation.thumbnail_url}
						<img src={animation.thumbnail_url} alt={animation.title} class="h-full w-full object-cover" />
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
							<Play class="h-16 w-16 text-primary/50" />
						</div>
					{/if}
				</div>
			</div>
			<div class="space-y-4">
				<h1 class="text-3xl font-bold">{animation.title}</h1>
				<div class="flex items-center justify-between">
					<div class="flex items-center space-x-3">
						<Avatar src={animation.author.avatar_url} name={animation.author.username} class="h-10 w-10" />
						<div>
							<p class="font-medium">{animation.author.display_name || animation.author.username}</p>
							<p class="text-sm text-muted-foreground">@{animation.author.username}</p>
						</div>
					</div>
					{#if animation.community}
						<span class="rounded-full bg-secondary px-2 py-0.5 text-sm">{animation.community.display_name}</span>
					{/if}
				</div>
				<div class="flex items-center space-x-6">
					<button
						class={cn('btn-outline-sm space-x-2', voted && 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600')}
						type="button"
						onclick={toggle}
						disabled={busy}
					>
						<span>{n}</span>
					</button>
					<div class="flex items-center space-x-1 text-muted-foreground">
						<MessageCircle class="h-4 w-4" />
						<span>{animation.comment_count} comments</span>
					</div>
					<span class="text-sm text-muted-foreground">{new Date(animation.created_at).toLocaleDateString()}</span>
				</div>
				{#if animation.description}
					<div class="card p-6">
						<h3 class="mb-3 font-semibold">description</h3>
						<p class="whitespace-pre-wrap text-muted-foreground">{animation.description}</p>
					</div>
				{/if}
			</div>
			<CommentsSection post_id={animation.id} />
		</div>
	</div>
</div>
