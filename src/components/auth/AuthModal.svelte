<script lang="ts">
	import { resolve } from '$app/paths';
	import Modal from '$components/Modal.svelte';
	import SignInForm from './SignInForm.svelte';
	import SignUpForm from './SignUpForm.svelte';

	let {
		open = $bindable(false),
		initial = 'signin' as 'signin' | 'signup'
	}: { open?: boolean; initial?: 'signin' | 'signup' } = $props();
	let mode = $state<'signin' | 'signup'>('signin');

	$effect(() => {
		if (open) mode = initial;
	});
</script>

<Modal bind:open title={mode === 'signin' ? 'welcome back' : 'create an account'}>
	<p class="mb-4 text-sm text-muted-foreground">
		{mode === 'signin' ? 'sign in to your account' : 'join the animator community'}
	</p>
	<a href={resolve('/login/google')} class="btn-outline mb-4 w-full gap-2">
		<svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"
			><path
				fill="currentColor"
				d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.2 12 6.2c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.68 3.65 14.53 2.7 12 2.7 6.87 2.7 2.7 6.87 2.7 12s4.17 9.3 9.3 9.3c5.37 0 8.93-3.77 8.93-9.09 0-.61-.07-1.08-.16-1.54z"
			/></svg
		>
		continue with google
	</a>
	<div class="mb-4 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
		<span class="h-px flex-1 bg-border"></span>or with email<span class="h-px flex-1 bg-border"
		></span>
	</div>
	{#if mode === 'signin'}
		<SignInForm on_toggle={() => (mode = 'signup')} />
	{:else}
		<SignUpForm on_toggle={() => (mode = 'signin')} />
	{/if}
</Modal>
