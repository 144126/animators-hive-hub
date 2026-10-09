<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { auth, display_name, sign_out } from '$lib/auth.svelte';
	import AuthModal from './auth/AuthModal.svelte';
	import Avatar from './Avatar.svelte';

	const a = auth();
	let menu = $state(false);
	let auth_open = $state(false);
	const name = $derived(display_name(a.user));
	const path = $derived(page.url.pathname);
	let wrap = $state<HTMLDivElement | undefined>();

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

	const link = (on: boolean) =>
		`relative pb-0.5 text-[10px] uppercase tracking-[0.2em] transition-colors duration-300 ${
			on ? 'text-ink' : 'text-mute hover:text-ink'
		}`;
</script>

<svelte:window onclick={on_doc} onkeydown={on_key} />

<header class="sticky top-0 z-50 w-full border-b border-line bg-base/80 backdrop-blur-md">
	<div class="wrap flex h-14 items-center gap-6">
		<a href={resolve('/')} class="flex items-center gap-2.5" aria-label="animators hive hub">
			<img src="/logo.svg" alt="" class="h-5 w-5" />
			<span class="hidden font-display text-[15px] tracking-[-0.02em] sm:inline"
				>animators hive hub</span
			>
		</a>
		<nav class="flex items-center gap-5">
			<a href={resolve('/')} class={link(path === '/')} aria-label="discover">discover</a>
			<a
				href={resolve('/communities')}
				class={link(path.startsWith('/communities') || path.startsWith('/c/'))}
				aria-label="communities">communities</a
			>
		</nav>
		<div class="ml-auto flex items-center">
			{#if a.user}
				<div class="relative" bind:this={wrap}>
					<button
						class="btn-icon"
						type="button"
						onclick={() => (menu = !menu)}
						aria-label="account"
					>
						<Avatar src={a.user.user_metadata?.avatar_url} {name} />
					</button>
					{#if menu}
						<div
							class="absolute right-0 mt-2 w-52 overflow-hidden rounded-[14px] border border-line bg-base-2 py-1"
						>
							<a
								href={resolve('/profile')}
								class="block px-3.5 py-2 text-[12.5px] text-ink-soft hover:bg-ember-soft hover:text-ink"
								onclick={() => (menu = false)}
							>
								view profile
							</a>
							<a
								href={resolve('/profile/edit')}
								class="block px-3.5 py-2 text-[12.5px] text-ink-soft hover:bg-ember-soft hover:text-ink"
								onclick={() => (menu = false)}
							>
								edit profile
							</a>
							<button
								class="block w-full px-3.5 py-2 text-left text-[12.5px] text-ink-soft hover:bg-ember-soft hover:text-ink"
								type="button"
								onclick={out}
							>
								sign out
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<button class="btn-ghost-sm" type="button" onclick={() => (auth_open = true)}
					>sign in</button
				>
			{/if}
		</div>
	</div>
</header>
<AuthModal bind:open={auth_open} />
