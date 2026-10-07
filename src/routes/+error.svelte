<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold">{page.status}</h1>
		<p class="mb-4 text-xl text-gray-600">{page.error?.message || 'page not found'}</p>
		<a href={resolve('/')} class="text-blue-500 underline hover:text-blue-700">return to home</a>
	</div>
</div>
