<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Plus, Upload } from '@lucide/svelte';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { create_animation, create_community } from '$lib/data';
	import { thumb_from_video, upload } from '$lib/upload';
	import CommunityCombobox from './CommunityCombobox.svelte';
	import FileUploadSection from './FileUploadSection.svelte';

	const a = auth();
	let open = $state(false);
	let title = $state('');
	let description = $state('');
	let video = $state<File | null>(null);
	let thumb = $state<File | null>(null);
	let community_id = $state('');
	let new_name = $state('');
	let busy = $state(false);

	function reset() {
		title = '';
		description = '';
		video = null;
		thumb = null;
		community_id = '';
		new_name = '';
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!a.user) return toast('error', 'you must be logged in to upload animations', 'err');
		if (!title.trim()) return toast('error', 'title is required', 'err');
		if (!video) return toast('error', 'please select a video file', 'err');
		if (video.size > 50 * 1024 * 1024)
			return toast('error', 'video file size must be less than 50mb', 'err');
		if (thumb && thumb.size > 5 * 1024 * 1024)
			return toast('error', 'image file size must be less than 5mb', 'err');
		if (community_id === 'create-new' && !new_name.trim())
			return toast('error', 'please enter a community name', 'err');
		busy = true;
		try {
			let cid: string | null = community_id === 'none' || !community_id ? null : community_id;
			if (community_id === 'create-new') cid = await create_community(new_name.trim());
			const video_url = await upload(video);
			let thumbnail_url: string | null = thumb ? await upload(thumb) : null;
			if (!thumbnail_url) {
				try {
					thumbnail_url = await upload(await thumb_from_video(video));
				} catch {
					/* optional */
				}
			}
			await create_animation({
				title: title.trim(),
				description: description.trim() || null,
				video_url,
				thumbnail_url,
				community_id: cid
			});
			toast('animation uploaded successfully!');
			open = false;
			reset();
			await invalidateAll();
		} catch {
			toast('error', 'failed to upload animation', 'err');
		} finally {
			busy = false;
		}
	}
</script>

{#if a.user}
	<button class="btn" type="button" onclick={() => (open = true)}>
		<Plus class="mr-2 h-4 w-4" /> add video
	</button>
	{#if open}
		<div
			class="overlay"
			onclick={() => !busy && (open = false)}
			onkeydown={(e) => e.key === 'Escape' && !busy && (open = false)}
			role="presentation"
		>
			<div
				class="modal max-h-[90vh] max-w-[600px] overflow-y-auto"
				tabindex="-1"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<h2 class="text-lg font-semibold">upload new animation</h2>
				<p class="mb-4 text-sm text-muted-foreground">share your animation with the community</p>
				<form onsubmit={submit} class="space-y-6">
					<div class="space-y-2">
						<label class="text-sm font-medium" for="title">title *</label>
						<input
							id="title"
							class="field"
							bind:value={title}
							placeholder="enter animation title"
							required
							disabled={busy}
						/>
					</div>
					<div class="space-y-2">
						<label class="text-sm font-medium" for="desc">description</label>
						<textarea
							id="desc"
							class="area"
							rows="3"
							bind:value={description}
							placeholder="describe your animation..."
							disabled={busy}
						></textarea>
					</div>
					<FileUploadSection bind:video bind:thumb disabled={busy} />
					<div class="space-y-2">
						<span class="text-sm font-medium">community (optional)</span>
						<CommunityCombobox bind:value={community_id} disabled={busy} />
					</div>
					{#if community_id === 'create-new'}
						<div class="space-y-2">
							<label class="text-sm font-medium" for="newc">new community name *</label>
							<input
								id="newc"
								class="field"
								bind:value={new_name}
								placeholder="enter community name"
								disabled={busy}
							/>
						</div>
					{/if}
					<div class="flex justify-end space-x-3">
						<button class="btn-outline" type="button" onclick={() => (open = false)} disabled={busy}
							>cancel</button
						>
						<button class="btn" type="submit" disabled={busy}>
							<Upload class="mr-2 h-4 w-4" />
							{busy ? 'uploading...' : 'upload animation'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
{/if}
