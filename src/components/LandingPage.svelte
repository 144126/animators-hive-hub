<script lang="ts">
	import { Video } from '@lucide/svelte';
	import AuthModal from './auth/AuthModal.svelte';
	let open = $state(false);
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<div class="flex items-center space-x-2">
				<Video class="h-8 w-8 text-primary" />
				<h1 class="text-2xl font-bold">the home for animators</h1>
			</div>
		</div>
	</header>
	<main class="container mx-auto px-4 py-24">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
				the home for animators
			</h1>
			<p class="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
				showcase your work, connect with peers, and get the feedback you need to grow
			</p>
			<button class="btn-lg" type="button" onclick={() => (open = true)}>sign up now</button>
		</div>
	</main>
	<AuthModal bind:open initial="signup" />
</div>
