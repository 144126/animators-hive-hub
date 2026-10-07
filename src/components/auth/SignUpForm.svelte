<script lang="ts">
	import { sign_up } from '$lib/auth.svelte';
	import { toast } from '$lib/toast.svelte';

	let { on_toggle }: { on_toggle: () => void } = $props();
	let busy = $state(false);
	let email = $state('');
	let password = $state('');
	let username = $state('');
	let confirm = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		if (password !== confirm) {
			toast('error', 'passwords do not match', 'err');
			return;
		}
		if (password.length < 6) {
			toast('error', 'password must be at least 6 characters', 'err');
			return;
		}
		busy = true;
		try {
			await sign_up(email, password, username);
		} catch {
			/* toast */
		} finally {
			busy = false;
		}
	}
</script>

<div class="space-y-6">
	<form onsubmit={submit} class="space-y-4">
		<div class="space-y-2">
			<label class="text-sm font-medium" for="username">username</label>
			<input
				id="username"
				class="field"
				type="text"
				bind:value={username}
				required
				disabled={busy}
				minlength="3"
				maxlength="50"
			/>
		</div>
		<div class="space-y-2">
			<label class="text-sm font-medium" for="email">email</label>
			<input id="email" class="field" type="email" bind:value={email} required disabled={busy} />
		</div>
		<div class="space-y-2">
			<label class="text-sm font-medium" for="password">password</label>
			<input
				id="password"
				class="field"
				type="password"
				bind:value={password}
				required
				disabled={busy}
				minlength="6"
			/>
		</div>
		<div class="space-y-2">
			<label class="text-sm font-medium" for="confirm">confirm password</label>
			<input
				id="confirm"
				class="field"
				type="password"
				bind:value={confirm}
				required
				disabled={busy}
				minlength="6"
			/>
		</div>
		<button class="btn w-full" type="submit" disabled={busy}
			>{busy ? 'creating account...' : 'sign up'}</button
		>
	</form>
	<div class="text-center">
		<button
			type="button"
			class="text-sm text-primary hover:underline"
			onclick={on_toggle}
			disabled={busy}
		>
			already have an account? sign in
		</button>
	</div>
</div>
