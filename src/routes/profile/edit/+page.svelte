<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowLeft, User, Save } from '@lucide/svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { auth, display_name } from '$lib/auth.svelte';
	import { change_password, delete_account, update_profile } from '$lib/data';
	import { toast } from '$lib/toast.svelte';
	import { upload } from '$lib/upload';
	import Avatar from '$components/Avatar.svelte';

	const a = auth();
	let display = $state('');
	let bio = $state('');
	let location = $state('');
	let website = $state('');
	let avatar = $state('');
	let avatar_busy = $state(false);
	let busy = $state(false);
	let primed = $state(false);
	let old_pass = $state('');
	let new_pass = $state('');
	let pass_busy = $state(false);
	let gone = $state('');
	let gone_busy = $state(false);

	$effect(() => {
		if (!a.user || primed) return;
		display =
			a.user.user_metadata?.display_name ||
			a.user.user_metadata?.username ||
			a.user.email?.split('@')[0] ||
			'';
		bio = a.user.user_metadata?.bio || '';
		location = a.user.user_metadata?.location || '';
		website = a.user.user_metadata?.website_url || '';
		avatar = a.user.user_metadata?.avatar_url || '';
		primed = true;
	});

	async function pick_avatar(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (!f) return;
		if (!f.type.startsWith('image/') || f.size > 5 * 1024 * 1024)
			return toast('error', 'pick an image under 5mb', 'err');
		avatar_busy = true;
		try {
			avatar = await upload(f);
		} catch (err) {
			toast('upload failed', err instanceof Error ? err.message : '', 'err');
		} finally {
			avatar_busy = false;
		}
	}

	async function save_pass(e: Event) {
		e.preventDefault();
		if (!a.user) return;
		pass_busy = true;
		try {
			await change_password(old_pass, new_pass);
			old_pass = '';
			new_pass = '';
			await invalidateAll();
			toast('password updated');
		} catch (err) {
			toast('failed to update password', err instanceof Error ? err.message : '', 'err');
		} finally {
			pass_busy = false;
		}
	}

	async function wipe(e: Event) {
		e.preventDefault();
		if (!a.user || !confirm('delete your account and everything you made?')) return;
		gone_busy = true;
		try {
			await delete_account(gone.trim());
			await goto(resolve('/'));
		} catch (err) {
			toast('failed to delete account', err instanceof Error ? err.message : '', 'err');
			gone_busy = false;
		}
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!a.user) return;
		if (!display.trim()) return toast('error', 'display name is required', 'err');
		if (website && website.length && !/^https?:\/\//.test(website))
			return toast('error', 'please enter a valid url', 'err');
		busy = true;
		try {
			await update_profile({
				display_name: display,
				bio,
				location,
				website_url: website,
				avatar_url: avatar
			});
			await invalidateAll();
			toast('profile updated!', 'your profile has been successfully updated.');
			goto(resolve('/profile'));
		} catch (err) {
			toast('failed to update profile', err instanceof Error ? err.message : '', 'err');
		} finally {
			busy = false;
		}
	}
</script>

{#if !a.user}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="mb-4 text-muted-foreground">please sign in to edit your profile.</p>
			<a class="btn" href={resolve('/')}>go to homepage</a>
		</div>
	</div>
{:else}
	<main class="container mx-auto max-w-2xl px-4 py-8">
		<div class="mb-6 flex items-center space-x-4">
			<a class="btn-icon" href={resolve('/profile')} aria-label="back"
				><ArrowLeft class="h-5 w-5" /></a
			>
			<User class="h-8 w-8 text-primary" />
			<h1 class="text-2xl font-bold">edit profile</h1>
		</div>
		<div class="card p-6">
			<h2 class="text-lg font-semibold">edit your profile</h2>
			<p class="mb-6 text-sm text-muted-foreground">
				update your profile information and let others know more about you.
			</p>
			<form onsubmit={submit} class="space-y-6">
				<div class="flex items-center space-x-4">
					<Avatar src={avatar} name={display_name(a.user)} class="h-20 w-20" />
					<div>
						<p class="text-sm font-medium">profile picture</p>
						<label class="btn-outline-sm mt-1 cursor-pointer">
							{avatar_busy ? 'uploading...' : 'change picture'}
							<input
								type="file"
								accept="image/*"
								class="hidden"
								onchange={pick_avatar}
								disabled={avatar_busy}
							/>
						</label>
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
					<input
						id="web"
						class="field"
						bind:value={website}
						placeholder="https://yourwebsite.com"
					/>
				</div>
				<div class="flex space-x-4">
					<button class="btn flex-1" type="submit" disabled={busy}>
						<Save class="mr-2 h-4 w-4" />
						{busy ? 'saving...' : 'save changes'}
					</button>
					<a class="btn-outline" href={resolve('/profile')}>cancel</a>
				</div>
			</form>
		</div>
		<div class="card mt-6 p-6">
			<h2 class="text-lg font-semibold">password</h2>
			<p class="mb-6 text-sm text-muted-foreground">
				{a.user.p
					? 'change your password. other sessions will end.'
					: 'set a password for email sign in.'}
			</p>
			<form onsubmit={save_pass} class="space-y-4">
				{#if a.user.p}
					<div class="space-y-2">
						<label class="text-sm font-medium" for="op">old password</label>
						<input id="op" class="field" type="password" bind:value={old_pass} required />
					</div>
				{/if}
				<div class="space-y-2">
					<label class="text-sm font-medium" for="np">new password</label>
					<input
						id="np"
						class="field"
						type="password"
						bind:value={new_pass}
						minlength="6"
						maxlength="200"
						required
					/>
				</div>
				<button class="btn" type="submit" disabled={pass_busy || new_pass.length < 6}
					>{pass_busy ? 'saving...' : a.user.p ? 'change password' : 'set password'}</button
				>
			</form>
		</div>
		<div class="card mt-6 p-6">
			<h2 class="text-lg font-semibold">delete account</h2>
			<p class="mb-6 text-sm text-muted-foreground">
				this removes your account, animations, comments and playlists. type your username to
				confirm.
			</p>
			<form onsubmit={wipe} class="space-y-4">
				<div class="space-y-2">
					<label class="text-sm font-medium" for="gone">username</label>
					<input id="gone" class="field" bind:value={gone} required />
				</div>
				<button class="btn" type="submit" disabled={gone_busy || !gone.trim()}
					>{gone_busy ? 'deleting...' : 'delete account'}</button
				>
			</form>
		</div>
	</main>
{/if}
