<script lang="ts">
	import '../app.css';
	import Header from '$components/Header.svelte';
	import Toasts from '$components/Toasts.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>animators hive hub</title>
</svelte:head>
<div class="flex min-h-[calc(100dvh/1.12)] flex-col">
	<Header />
	<main class="flex-1">{@render children()}</main>
</div>
<Toasts />
