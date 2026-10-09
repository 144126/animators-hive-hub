<script lang="ts">
	import { toasts } from '$lib/toast.svelte';
	const items = $derived(toasts());
</script>

<div class="fixed right-4 top-4 z-[80] flex w-80 flex-col gap-2" aria-live="polite">
	{#each items as t (t.id)}
		<div
			class="rounded-[10px] border border-line bg-base-2 px-3 py-2 text-sm {t.kind === 'err'
				? 'border-danger'
				: ''}"
		>
			<p class="font-medium">{t.title}</p>
			{#if t.description}<p class="text-mute">{t.description}</p>{/if}
		</div>
	{/each}
</div>
