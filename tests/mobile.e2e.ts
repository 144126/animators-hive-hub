import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('phone can reach communities without sideways scroll', async ({ app, screen, browser }) => {
	await browser.setViewport({ width: 375, height: 667 });
	await app.open('/');
	expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
		true
	);
	await screen.getByRole('link', 'communities').tap();
	await expect(screen.getByRole('heading', 'communities')).toBeVisible();
	expect(await browser.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
		true
	);
});
