import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { describe, test, expect } from 'vitest';

describe('public', async () => {
	await setup({
		host: 'http://localhost:3000',
	});

	// Playwright defaults to en-US, which the locale middleware would treat as
	// an English preference; pin Danish so the existing assertions keep
	// testing the Danish surface (implementation brief §7.12).
	const createDanishPage = () =>
		createPage(undefined, {
			locale: 'da-DK',
			extraHTTPHeaders: { 'Accept-Language': 'da-DK,da' },
		});

	test('landing', async () => {
		const page = await createDanishPage();
		await page.goto(url('/'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe(' Velkommen til Hibiscusvej 2-30 ');
	});

	test('privacy', async () => {
		const page = await createDanishPage();
		await page.goto(url('/privacy'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Privatlivspolitik');
	});
});
