<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<div class="wrap flex min-h-[60vh] items-center justify-center">
	<div class="text-center">
		<p class="eyebrow mb-4">{page.status}</p>
		<h1 class="h1 mb-4">{page.error?.message || 'page not found'}</h1>
		<a href={resolve('/')} class="text-ember hover:text-ink">return home</a>
	</div>
</div>
