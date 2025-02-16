import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { describe, test, expect } from 'vitest';

describe('public', async () => {
	await setup({
		host: 'http://localhost:3000',
	});

	test('landing', async () => {
		const page = await createPage();
		await page.goto(url('/'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Velkommen til Hibiscusvej 2-30');
	});

	test('privacy', async () => {
		const page = await createPage();
		await page.goto(url('/privacy'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Privatlivspolitik');
	});
});
