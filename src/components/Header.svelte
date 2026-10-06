<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth, display_name, sign_out } from '$lib/auth.svelte';
	import { User, LogOut, Edit } from '@lucide/svelte';
	import AuthModal from './auth/AuthModal.svelte';
	import Avatar from './Avatar.svelte';

	const a = auth();
	let menu = $state(false);
	let auth_open = $state(false);
	const name = $derived(display_name(a.user));
	const path = $derived(page.url.pathname);

	async function out() {
		menu = false;
		await sign_out();
		goto('/');
	}
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
	<div class="container mx-auto flex h-14 items-center px-4">
		<div class="mr-auto flex items-center">
			<a href="/" class="mr-6 font-bold">animation</a>
			<nav class="hidden items-center space-x-6 text-sm font-medium md:flex">
				<a href="/" class={path === '/' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}>discover</a>
				<a href="/communities" class={path.startsWith('/communities') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}>communities</a>
			</nav>
		</div>
		{#if !a.loading}
			{#if a.user}
				<div class="relative">
					<button class="btn-icon" type="button" onclick={() => (menu = !menu)} aria-label="account">
						<Avatar src={a.user.user_metadata?.avatar_url} name={name} />
					</button>
					{#if menu}
						<div class="absolute right-0 mt-2 w-56 rounded-md border bg-background py-1 shadow">
							<a href="/profile" class="flex items-center px-3 py-2 text-sm hover:bg-accent" onclick={() => (menu = false)}>
								<User class="mr-2 h-4 w-4" /> view profile
							</a>
							<a href="/profile/edit" class="flex items-center px-3 py-2 text-sm hover:bg-accent" onclick={() => (menu = false)}>
								<Edit class="mr-2 h-4 w-4" /> edit profile
							</a>
							<button class="flex w-full items-center px-3 py-2 text-sm hover:bg-accent" type="button" onclick={out}>
								<LogOut class="mr-2 h-4 w-4" /> sign out
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<button class="btn-ghost-sm" type="button" onclick={() => (auth_open = true)}>sign in</button>
				<AuthModal bind:open={auth_open} />
			{/if}
		{/if}
	</div>
</header>
