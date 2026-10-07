<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		children
	}: { open?: boolean; title: string; children: Snippet } = $props();

	let box: HTMLDivElement | undefined;
	let last: HTMLElement | null = null;
	const hid = $derived(`m-${title.replace(/\s+/g, '-')}`);

	function nodes() {
		return [
			...(box?.querySelectorAll<HTMLElement>(
				'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
			) ?? [])
		];
	}

	function trap(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
			return;
		}
		if (e.key !== 'Tab') return;
		const list = nodes();
		if (!list.length) return;
		const first = list[0];
		const end = list[list.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			end.focus();
		} else if (!e.shiftKey && document.activeElement === end) {
			e.preventDefault();
			first.focus();
		}
	}

	$effect(() => {
		if (!open) return;
		last = document.activeElement as HTMLElement | null;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => nodes()[0]?.focus());
		return () => {
			document.body.style.overflow = prev;
			last?.focus();
		};
	});
</script>

<svelte:window onkeydown={trap} />

{#if open}
	<div class="overlay" onclick={() => (open = false)} role="presentation">
		<div
			bind:this={box}
			class="modal max-h-[90vh] overflow-y-auto"
			role="dialog"
			aria-modal="true"
			aria-labelledby={hid}
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id={hid} class="text-lg font-semibold">{title}</h2>
			{@render children()}
		</div>
	</div>
{/if}
