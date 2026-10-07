<script lang="ts">
	import { toasts } from '$lib/toast.svelte';
	const items = $derived(toasts());
</script>

<div class="fixed right-4 top-4 z-[80] flex w-80 flex-col gap-2">
	{#each items as t (t.id)}
		<div
			class="rounded-md border bg-background px-3 py-2 text-sm shadow {t.kind === 'err'
				? 'border-destructive'
				: ''}"
		>
			<p class="font-medium">{t.title}</p>
			{#if t.description}<p class="text-muted-foreground">{t.description}</p>{/if}
		</div>
	{/each}
</div>
