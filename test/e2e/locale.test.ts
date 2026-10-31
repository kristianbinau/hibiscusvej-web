import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { request } from 'playwright-core';
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { LOCALE_COOKIE } from '#shared/constants';

// Page strings are asserted against the catalogs instead of hardcoded text,
// so a copy edit cannot break the tests (implementation brief §3.12).
const da = parse(
	readFileSync(new URL('../../i18n/locales/da.yaml', import.meta.url), 'utf8'),
) as Record<string, any>;
const en = parse(
	readFileSync(new URL('../../i18n/locales/en.yaml', import.meta.url), 'utf8'),
) as Record<string, any>;

// Content pages are not part of the catalog; their titles come from the
// markdown frontmatter.
const enPrivacyTitle = (
	parse(
		readFileSync(
			new URL('../../content/pages-en/privacy.md', import.meta.url),
			'utf8',
		).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '',
	) as { title: string }
).title;

// Redirect semantics of the custom locale middleware (implementation brief
// §3.5). `maxRedirects: 0` makes the API request context return the redirect
// response itself instead of following it, so status, `Location` and
// `Set-Cookie` can be asserted.
const danishHeaders = { 'accept-language': 'da-DK,da' };
const englishHeaders = { 'accept-language': 'en-US,en' };

describe('locale redirect matrix', async () => {
	await setup({
		host: 'http://localhost:3000',
	});

	const baseURL = new URL(url('/')).origin;

	const cookiePrefixed = (value: string) => ({
		name: LOCALE_COOKIE,
		value,
		domain: new URL(url('/')).hostname,
		path: '/',
		expires: -1,
		httpOnly: false,
		secure: false,
		sameSite: 'Lax' as const,
	});

	// `addCookies` is not available on the standalone request context; the
	// cookie preference is seeded through `storageState` instead.
	const newApiContext = (localeCookie?: string) =>
		request.newContext({
			baseURL,
			...(localeCookie
				? { storageState: { cookies: [cookiePrefixed(localeCookie)] } }
				: {}),
		});

	test('unprefixed URLs serve Danish', async () => {
		const api = await newApiContext();
		const res = await api.get(url('/'), {
			headers: danishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(200);
	});

	test('a cookie preference redirects mismatched URLs (302)', async () => {
		const api = await newApiContext('en');
		const res = await api.get(url('/'), {
			headers: danishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(302);
		expect(res.headers().location).toBe('/en');
	});

	test('a cookie preference redirects English URLs back to Danish', async () => {
		const api = await newApiContext('da');
		const res = await api.get(url('/en/privacy'), {
			headers: englishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(302);
		expect(res.headers().location).toBe('/privacy');
	});

	test('the browser-language redirect writes the cookie on the redirect response', async () => {
		const api = await newApiContext();
		const res = await api.get(url('/'), {
			headers: englishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(302);
		expect(res.headers().location).toBe('/en');
		const setCookies = res
			.headersArray()
			.filter((header) => header.name === 'set-cookie');
		expect(
			setCookies.some((header) => header.value.includes(`${LOCALE_COOKIE}=en`)),
		).toBe(true);
	});

	test('the browser language never overrides the cookie preference', async () => {
		// The browser-derived redirect happens on initial entry only; once a
		// cookie preference exists it is authoritative on every navigation.
		const api = await newApiContext('da');
		const res = await api.get(url('/'), {
			headers: englishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(200);
	});

	test('/en/u redirects to the English booking page', async () => {
		const api = await newApiContext();
		const res = await api.get(url('/en/u'), {
			headers: englishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(302);
		expect(res.headers().location).toBe('/en/u/communal/book');
	});

	test('/en/u/admin/users does not exist (admin routes are unlocalized)', async () => {
		const api = await newApiContext();
		const res = await api.get(url('/en/u/admin/users'), {
			headers: englishHeaders,
			maxRedirects: 0,
		});

		expect(res.status()).toBe(404);
	});

	test('/en/ renders the English front page', async () => {
		const page = await createPage(undefined, {
			locale: 'en-US',
			extraHTTPHeaders: { 'Accept-Language': 'en-US,en' },
		});
		await page.goto(url('/en'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');

		expect(text?.trim()).toBe(en.home.welcome);
	});

	test('/en/privacy renders English content', async () => {
		const page = await createPage(undefined, {
			locale: 'en-US',
			extraHTTPHeaders: { 'Accept-Language': 'en-US,en' },
		});
		await page.goto(url('/en/privacy'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');

		expect(text).toBe(enPrivacyTitle);
	});

	test('the Danish front page renders the Danish welcome text', async () => {
		const page = await createPage(undefined, {
			locale: 'da-DK',
			extraHTTPHeaders: { 'Accept-Language': 'da-DK,da' },
		});
		await page.goto(url('/'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');

		expect(text?.trim()).toBe(da.home.welcome);
	});

	test('the public header language picker switches to Danish', async () => {
		const page = await createPage(undefined, {
			locale: 'en-US',
			extraHTTPHeaders: { 'Accept-Language': 'en-US,en' },
		});
		await page.goto(url('/en'), { waitUntil: 'hydration' });

		// The trigger's accessible name follows the active locale...
		await page.getByRole('button', { name: en.nav.languageCurrent }).click();
		// ...while the menu items are native names, never translated.
		await page.getByRole('menuitemcheckbox', { name: 'Dansk' }).click();

		await page.waitForURL(url('/'));
		const text = await page.textContent('h1');
		expect(text?.trim()).toBe(da.home.welcome);
	});
});
