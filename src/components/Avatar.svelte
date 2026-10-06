<script lang="ts">
	import { initial } from '$lib/utils';

	let { src = null as string | null, name = '?', class: cls = 'h-8 w-8' }: { src?: string | null; name?: string; class?: string } = $props();
	let broken = $state(false);
</script>

<span class="inline-flex shrink-0 overflow-hidden rounded-full bg-muted {cls}">
	{#if src && !broken}
		<img {src} alt="" class="h-full w-full object-cover" onerror={() => (broken = true)} />
	{:else}
		<span class="flex h-full w-full items-center justify-center text-xs font-medium">{initial(name)}</span>
	{/if}
</span>
