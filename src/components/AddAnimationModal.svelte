<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';
	import { create_animation, create_community } from '$lib/data';
	import { thumb_from_video, upload } from '$lib/upload';
	import CommunityCombobox from './CommunityCombobox.svelte';
	import FileUploadSection from './FileUploadSection.svelte';
	import Modal from './Modal.svelte';
	import { comm_name_max, desc_max, title_max } from '$lib/rules';

	const a = auth();
	let open = $state(false);
	let title = $state('');
	let description = $state('');
	let video = $state<File | null>(null);
	let thumb = $state<File | null>(null);
	let community_id = $state('');
	let new_name = $state('');
	let busy = $state(false);
	let step = $state('');

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
			if (community_id === 'create-new') {
				step = 'saving...';
				cid = await create_community(new_name.trim());
			}
			step = 'uploading video...';
			const video_url = await upload(video);
			let thumbnail_url: string | null = null;
			if (thumb) {
				step = 'uploading thumbnail...';
				thumbnail_url = await upload(thumb);
			} else {
				try {
					step = 'making thumbnail...';
					thumbnail_url = await upload(await thumb_from_video(video));
				} catch {
					/* optional */
				}
			}
			step = 'saving...';
			await create_animation({
				title: title.trim(),
				description: description.trim() || null,
				video_url,
				thumbnail_url,
				community_id: cid
			});
			toast('animation uploaded');
			open = false;
			reset();
			await invalidateAll();
		} catch (err) {
			toast('error', err instanceof Error ? err.message : 'failed to upload animation', 'err');
		} finally {
			busy = false;
			step = '';
		}
	}
</script>

{#if a.user}
	<button class="btn" type="button" onclick={() => (open = true)}>add video</button>
	<Modal bind:open title="upload new animation" wide>
		<p class="mb-4 text-sm text-ink-soft">share your animation with the hive</p>
		<form onsubmit={submit} class="space-y-6">
			<div class="space-y-2">
				<label class="text-sm" for="title">title *</label>
				<input
					id="title"
					class="field"
					bind:value={title}
					placeholder="enter animation title"
					required
					maxlength={title_max}
					disabled={busy}
				/>
			</div>
			<div class="space-y-2">
				<label class="text-sm" for="desc">description</label>
				<textarea
					id="desc"
					class="area"
					rows="3"
					bind:value={description}
					placeholder="describe your animation..."
					maxlength={desc_max}
					disabled={busy}
				></textarea>
			</div>
			<FileUploadSection bind:video bind:thumb disabled={busy} />
			<div class="space-y-2">
				<span class="text-sm">community (optional)</span>
				<CommunityCombobox bind:value={community_id} disabled={busy} />
			</div>
			{#if community_id === 'create-new'}
				<div class="space-y-2">
					<label class="text-sm" for="newc">new community name *</label>
					<input
						id="newc"
						class="field"
						bind:value={new_name}
						placeholder="enter community name"
						maxlength={comm_name_max}
						disabled={busy}
					/>
				</div>
			{/if}
			<div class="flex justify-end gap-3">
				<button class="btn-outline" type="button" onclick={() => (open = false)} disabled={busy}
					>cancel</button
				>
				<button class="btn" type="submit" disabled={busy}>
					{busy ? step || 'saving...' : 'upload animation'}
				</button>
			</div>
		</form>
	</Modal>
{/if}
