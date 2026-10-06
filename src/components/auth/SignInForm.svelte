<script lang="ts">
	import { sign_in, sign_in_google, auth } from '$lib/auth.svelte';
	import GoogleIcon from '$components/GoogleIcon.svelte';

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
	<button class="btn-outline w-full" type="button" onclick={() => sign_in_google()} disabled={a.loading}>
		<GoogleIcon class="mr-2 h-4 w-4" />
		sign in with google
	</button>
	<div class="relative">
		<div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background px-2 text-muted-foreground">or continue with email</span>
		</div>
	</div>
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
