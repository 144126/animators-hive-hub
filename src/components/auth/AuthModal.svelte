<script lang="ts">
	import SignInForm from './SignInForm.svelte';
	import SignUpForm from './SignUpForm.svelte';

	let { open = $bindable(false), initial = 'signin' as 'signin' | 'signup' }: { open?: boolean; initial?: 'signin' | 'signup' } =
		$props();
	let mode = $state(initial);

	$effect(() => {
		if (open) mode = initial;
	});

	function close() {
		open = false;
	}
</script>

{#if open}
	<div class="overlay" onclick={close} onkeydown={(e) => e.key === 'Escape' && close()} role="presentation">
		<div class="modal sm:max-w-md" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<button class="btn-icon absolute right-2 top-2" type="button" onclick={close} aria-label="close">×</button>
			<div class="mb-4 text-center">
				<h2 class="text-2xl font-bold">{mode === 'signin' ? 'welcome back' : 'create an account'}</h2>
				<p class="text-muted-foreground">{mode === 'signin' ? 'sign in to your account' : 'join the animator community'}</p>
			</div>
			{#if mode === 'signin'}
				<SignInForm on_toggle={() => (mode = 'signup')} />
			{:else}
				<SignUpForm on_toggle={() => (mode = 'signin')} />
			{/if}
		</div>
	</div>
{/if}
