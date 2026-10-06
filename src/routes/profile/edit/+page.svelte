<script lang="ts">
	import { ArrowLeft, User, Save } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { auth, display_name, set_user } from '$lib/auth.svelte';
	import { update_profile } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import Avatar from '$components/Avatar.svelte';

	const a = auth();
	let display = $state('');
	let bio = $state('');
	let location = $state('');
	let website = $state('');
	let busy = $state(false);
	let primed = $state(false);

	$effect(() => {
		if (!a.user || primed) return;
		display = a.user.user_metadata?.display_name || a.user.user_metadata?.username || a.user.email?.split('@')[0] || '';
		bio = a.user.user_metadata?.bio || '';
		location = a.user.user_metadata?.location || '';
		website = a.user.user_metadata?.website_url || '';
		primed = true;
	});

	async function submit(e: Event) {
		e.preventDefault();
		if (!a.user) return;
		if (!display.trim()) return toast('error', 'display name is required', 'err');
		if (website && website.length && !/^https?:\/\//.test(website)) return toast('error', 'please enter a valid url', 'err');
		busy = true;
		try {
			set_user(await update_profile({ display_name: display, bio, location, website_url: website }));
			toast('profile updated!', 'your profile has been successfully updated.');
			goto('/profile');
		} catch (err) {
			toast('failed to update profile', err instanceof Error ? err.message : '', 'err');
		} finally {
			busy = false;
		}
	}
</script>

{#if a.loading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
	</div>
{:else if !a.user}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="mb-4 text-muted-foreground">please sign in to edit your profile.</p>
			<a class="btn" href="/">go to homepage</a>
		</div>
	</div>
{:else}
	<header class="border-b">
		<div class="container mx-auto flex items-center space-x-4 px-4 py-4">
			<a class="btn-icon" href="/profile"><ArrowLeft class="h-5 w-5" /></a>
			<User class="h-8 w-8 text-primary" />
			<h1 class="text-2xl font-bold">edit profile</h1>
		</div>
	</header>
	<main class="container mx-auto max-w-2xl px-4 py-8">
		<div class="card p-6">
			<h2 class="text-lg font-semibold">edit your profile</h2>
			<p class="mb-6 text-sm text-muted-foreground">update your profile information and let others know more about you.</p>
			<form onsubmit={submit} class="space-y-6">
				<div class="flex items-center space-x-4">
					<Avatar src={a.user.user_metadata?.avatar_url} name={display_name(a.user)} class="h-20 w-20" />
					<div>
						<p class="text-sm font-medium">profile picture</p>
						<p class="text-sm text-muted-foreground">avatar is managed through your authentication provider</p>
					</div>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="dn">display name</label>
					<input id="dn" class="field" bind:value={display} maxlength="50" required />
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="bio">bio</label>
					<textarea id="bio" class="area min-h-[100px]" bind:value={bio} maxlength="500"></textarea>
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="loc">location</label>
					<input id="loc" class="field" bind:value={location} maxlength="100" />
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="web">website</label>
					<input id="web" class="field" bind:value={website} placeholder="https://yourwebsite.com" />
				</div>
				<div class="flex space-x-4">
					<button class="btn flex-1" type="submit" disabled={busy}>
						<Save class="mr-2 h-4 w-4" />
						{busy ? 'saving...' : 'save changes'}
					</button>
					<a class="btn-outline" href="/profile">cancel</a>
				</div>
			</form>
		</div>
	</main>
{/if}
