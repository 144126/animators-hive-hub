<script lang="ts">
	import AuthModal from './auth/AuthModal.svelte';
	let open = $state(false);
</script>

<div class="wrap py-24 md:py-32">
	<p class="eyebrow mb-6">for animators</p>
	<h1 class="h1 mb-6 max-w-xl">animators hive hub</h1>
	<p class="mb-12 max-w-lg text-[16px] leading-relaxed text-ink-soft md:text-[18px]">
		show your work. find other animators. keep the pieces that matter in one place.
	</p>
	<button class="btn-lg" type="button" onclick={() => (open = true)}>sign up now</button>
</div>
<AuthModal bind:open initial="signup" />
