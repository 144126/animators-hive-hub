import { randomBytes } from 'node:crypto';
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

const name = () => 'smk' + randomBytes(4).toString('hex');

async function ready(
	app: { open: (p: string) => Promise<void> },
	browser: { evaluate: (fn: () => boolean) => Promise<boolean> }
) {
	await app.open('/');
	await expect
		.poll(() => browser.evaluate(() => !!document.getElementById('svelte-announcer')), {
			timeout: 15_000
		})
		.toBe(true);
}

test('a guest sees the landing page', async ({ app, screen }) => {
	await app.open('/');
	await expect(screen.getByRole('heading', 'animators hive hub')).toBeVisible();
	await expect(screen.getByRole('button', 'sign up now')).toBeVisible();
});

test('escape closes sign-in and tab stays inside', async ({ app, screen, browser }) => {
	await ready(app, browser);
	await screen.getByRole('button', 'sign in').tap();
	await expect(screen.getByRole('dialog')).toBeVisible();
	await browser.keyboard.press('Escape');
	await expect(screen.getByRole('dialog')).not.toBeVisible();
	await screen.getByRole('button', 'sign in').tap();
	await expect(screen.getByRole('dialog')).toBeVisible();
	for (let i = 0; i < 12; i++) await browser.keyboard.press('Tab');
	expect(
		await browser.evaluate(() => {
			const d = document.querySelector('[role="dialog"]');
			return !!(d && d.contains(document.activeElement));
		})
	).toBe(true);
});

test('sign up, upload, upvote and comment', async ({ app, screen, browser }) => {
	const n = name();
	await ready(app, browser);
	await screen.getByRole('button', 'sign up now').tap();
	await screen.getByLabel('username').fill(n);
	await screen.getByLabel('email').fill(`${n}@example.com`);
	await screen.getByLabel('password', { exact: true }).fill('smoke-pass-1');
	await screen.getByLabel('confirm password').fill('smoke-pass-1');
	await screen.getByRole('button', 'sign up').tap();
	await expect(screen.getByRole('heading', 'discover')).toBeVisible();
	await screen.getByRole('button', 'add video').tap();
	const title = `tiny ${n}`;
	await screen.getByLabel('title *').fill(title);
	await screen.getByLabel('video file *').setInputFiles('tests/fixtures/tiny.mp4');
	await screen.getByRole('button', 'upload animation').tap();
	await expect(screen.getByRole('heading', title)).toBeVisible();
	await expect(browser.locator(`img[alt="${title}"]`)).toBeVisible();
	await screen.getByRole('link', title).first().tap();
	await expect(browser).toHaveURL(/\/animation\//);
	await expect(screen.getByRole('heading', title)).toBeVisible();
	await expect
		.poll(
			() => browser.evaluate(() => document.querySelector('video')?.getAttribute('src') || ''),
			{ timeout: 10_000 }
		)
		.toMatch(/^\/media\//);
	await screen.getByRole('button', '0').tap();
	await expect(screen.getByRole('button', '1')).toBeVisible();
	await screen.getByRole('textbox').fill('nice work');
	await screen.getByRole('button', 'post comment').tap();
	await expect(screen.getByText('nice work')).toBeVisible();
});
