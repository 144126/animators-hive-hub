<script lang="ts">
	import { sign_in, auth } from '$lib/auth.svelte';

	let { on_toggle }: { on_toggle: () => void } = $props();
	const a = auth();
	let email = $state('');
	let password = $state('');

	async function submit(e: Event) {
		e.preventDefault();
		try {
			await sign_in(email, password);
		} catch {
			/* toast */
		}
	}
</script>

<div class="space-y-6">
	<form onsubmit={submit} class="space-y-4">
		<div class="space-y-2">
			<label class="text-sm font-medium" for="email">email</label>
			<input id="email" class="field" type="email" bind:value={email} required disabled={a.loading} />
		</div>
		<div class="space-y-2">
			<label class="text-sm font-medium" for="password">password</label>
			<input id="password" class="field" type="password" bind:value={password} required disabled={a.loading} />
		</div>
		<button class="btn w-full" type="submit" disabled={a.loading}>{a.loading ? 'signing in...' : 'sign in'}</button>
	</form>
	<div class="text-center">
		<button type="button" class="text-sm text-primary hover:underline" onclick={on_toggle} disabled={a.loading}>
			don't have an account? sign up
		</button>
	</div>
</div>
