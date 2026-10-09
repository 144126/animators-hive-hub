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
	<p class="mb-4 text-sm text-ink-soft">
		{mode === 'signin' ? 'sign in to your account' : 'join the hive'}
	</p>
	<a href={resolve('/login/google')} class="btn-outline mb-4 w-full">continue with google</a>
	<div class="mb-4 flex items-center gap-3 text-xs text-mute" aria-hidden="true">
		<span class="h-px flex-1 bg-line"></span>or with email<span class="h-px flex-1 bg-line"></span>
	</div>
	{#if mode === 'signin'}
		<SignInForm on_toggle={() => (mode = 'signup')} />
	{:else}
		<SignUpForm on_toggle={() => (mode = 'signin')} />
	{/if}
</Modal>
