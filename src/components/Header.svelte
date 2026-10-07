<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth, display_name, sign_out } from '$lib/auth.svelte';
	import { Compass, Users, User, LogOut, Edit } from '@lucide/svelte';
	import AuthModal from './auth/AuthModal.svelte';
	import Avatar from './Avatar.svelte';

	const a = auth();
	let menu = $state(false);
	let auth_open = $state(false);
	const name = $derived(display_name(a.user));
	const path = $derived(page.url.pathname);
	let wrap: HTMLDivElement | undefined;

	async function out() {
		menu = false;
		await sign_out();
		goto(resolve('/'));
	}

	function on_doc(e: MouseEvent) {
		if (wrap && !wrap.contains(e.target as Node)) menu = false;
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Escape') menu = false;
	}
</script>

<svelte:window onclick={on_doc} onkeydown={on_key} />

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
	<div class="container mx-auto flex h-14 items-center px-4">
		<div class="mr-auto flex items-center">
			<a href={resolve('/')} class="mr-6 font-bold">animation</a>
			<nav class="flex items-center space-x-4 text-sm font-medium md:space-x-6">
				<a
					href={resolve('/')}
					class="flex items-center {path === '/'
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
					aria-label="discover"
				>
					<Compass class="h-5 w-5 md:hidden" />
					<span class="hidden md:inline">discover</span>
				</a>
				<a
					href={resolve('/communities')}
					class="flex items-center {path.startsWith('/communities')
						? 'text-foreground'
						: 'text-muted-foreground hover:text-foreground'}"
					aria-label="communities"
				>
					<Users class="h-5 w-5 md:hidden" />
					<span class="hidden md:inline">communities</span>
				</a>
			</nav>
		</div>
		{#if a.user}
			<div class="relative" bind:this={wrap}>
				<button class="btn-icon" type="button" onclick={() => (menu = !menu)} aria-label="account">
					<Avatar src={a.user.user_metadata?.avatar_url} {name} />
				</button>
				{#if menu}
					<div class="absolute right-0 mt-2 w-56 rounded-md border bg-background py-1 shadow">
						<a
							href={resolve('/profile')}
							class="flex items-center px-3 py-2 text-sm hover:bg-accent"
							onclick={() => (menu = false)}
						>
							<User class="mr-2 h-4 w-4" /> view profile
						</a>
						<a
							href={resolve('/profile/edit')}
							class="flex items-center px-3 py-2 text-sm hover:bg-accent"
							onclick={() => (menu = false)}
						>
							<Edit class="mr-2 h-4 w-4" /> edit profile
						</a>
						<button
							class="flex w-full items-center px-3 py-2 text-sm hover:bg-accent"
							type="button"
							onclick={out}
						>
							<LogOut class="mr-2 h-4 w-4" /> sign out
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<button class="btn-ghost-sm" type="button" onclick={() => (auth_open = true)}>sign in</button>
		{/if}
	</div>
</header>
<AuthModal bind:open={auth_open} />
