<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<div class="flex min-h-screen items-center justify-center bg-background">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold">{page.status}</h1>
		<p class="mb-4 text-xl text-muted-foreground">{page.error?.message || 'page not found'}</p>
		<a href={resolve('/')} class="text-primary underline hover:opacity-80">return to home</a>
	</div>
</div>
