<script lang="ts">
	let {
		video = $bindable<File | null>(null),
		thumb = $bindable<File | null>(null),
		disabled = false
	}: { video?: File | null; thumb?: File | null; disabled?: boolean } = $props();

	let video_el: HTMLInputElement | undefined = $state();
	let thumb_el: HTMLInputElement | undefined = $state();

	function pick_video(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (f) video = f;
	}
	function pick_thumb(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (f) thumb = f;
	}
</script>

<div class="space-y-2">
	<label class="text-sm" for="video-file">video file *</label>
	<div class="flex items-center gap-2">
		<button type="button" class="btn-outline flex-1" onclick={() => video_el?.click()} {disabled}>
			{video ? video.name : 'select video file'}
		</button>
		{#if video}
			<button
				type="button"
				class="btn-icon"
				onclick={() => (video = null)}
				{disabled}
				aria-label="clear video">×</button
			>
		{/if}
	</div>
	<input
		bind:this={video_el}
		id="video-file"
		type="file"
		accept="video/mp4,video/webm,video/quicktime"
		class="hidden"
		onchange={pick_video}
		{disabled}
	/>
	<p class="text-xs text-mute">mp4, webm or mov. max size: 50mb</p>
</div>
<div class="space-y-2">
	<label class="text-sm" for="thumb-file">custom thumbnail (optional)</label>
	<div class="flex items-center gap-2">
		<button type="button" class="btn-outline flex-1" onclick={() => thumb_el?.click()} {disabled}>
			{thumb ? thumb.name : 'select thumbnail image'}
		</button>
		{#if thumb}
			<button
				type="button"
				class="btn-icon"
				onclick={() => (thumb = null)}
				{disabled}
				aria-label="clear thumbnail">×</button
			>
		{/if}
	</div>
	<input
		bind:this={thumb_el}
		id="thumb-file"
		type="file"
		accept="image/*"
		class="hidden"
		onchange={pick_thumb}
		{disabled}
	/>
	<p class="text-xs text-mute">if not provided, a still is taken from the video. max size: 5mb</p>
</div>
