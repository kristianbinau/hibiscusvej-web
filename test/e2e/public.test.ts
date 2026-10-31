import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// Page strings are asserted against the Danish catalog (the source of
// truth) instead of hardcoded text, so a copy edit cannot break the tests
// and the assertions stay meaningful if the pinned test locale changes.
const da = parse(
	readFileSync(new URL('../../i18n/locales/da.yaml', import.meta.url), 'utf8'),
) as Record<string, any>;

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
		expect(text?.trim()).toBe(da.home.welcome);
	});

	test('privacy', async () => {
		const page = await createDanishPage();
		await page.goto(url('/privacy'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Privatlivspolitik');
	});
});
