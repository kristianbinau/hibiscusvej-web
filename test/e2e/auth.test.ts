import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

// Page strings and field labels are asserted against the Danish catalog
// (the source of truth) instead of hardcoded text, so a copy edit cannot
// break the tests and the assertions stay meaningful if the pinned test
// locale changes.
const da = parse(
	readFileSync(new URL('../../i18n/locales/da.yaml', import.meta.url), 'utf8'),
) as Record<string, any>;

describe('auth', async () => {
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

	test('login', async () => {
		/**
		 * Navigate to Login, Validate Title
		 */

		const page = await createDanishPage();
		await page.goto(url('/auth/login'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');

		expect(text?.trim()).toBe(da.auth.login.title);

		/**
		 * Fill & Submit Form, Validate Response
		 */

		await page
			.getByRole('textbox', { name: da.auth.fields.email })
			.fill('kristian@binau.me');
		await page
			.getByRole('textbox', { name: da.auth.login.passwordLabel })
			.fill('kristian@binau.me');

		const loginResponsePromise = page.waitForResponse(
			url('/api/app/auth/login'),
		);
		await page.getByRole('button', { name: da.auth.login.submit }).click();
		const loginResponse = await loginResponsePromise;

		expect(loginResponse.status()).toBe(200);

		/**
		 * Wait for Redirect, Validate URL
		 */

		await page.waitForURL(url('/u/communal/book'));
		expect(page.url()).toBe(url('/u/communal/book'));

		/**
		 * Reset the stored language preference. The locale middleware lets a
		 * logged-in user's stored preference win over the browser language on
		 * the reloads below, so the test must run against the Danish
		 * preference regardless of what previous sessions stored.
		 */

		await page.evaluate(async () => {
			// The service worker injects the Authorization header.
			await fetch('/api/app/users/me/language', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ language: 'da' }),
			});
		});

		/**
		 * Delete Auth Storage & Reload Page, Validate Still Logged In
		 */

		await page.evaluate(() => {
			window.indexedDB.deleteDatabase('service-worker-auth-storage');
		});
		// Double reload to make sure the database is deleted
		await page.reload({ waitUntil: 'domcontentloaded' });
		await page.reload({ waitUntil: 'domcontentloaded' });

		expect(page.url()).toBe(url('/u/communal/book'));
	}, 10_000);

	test('register', async () => {
		const page = await createDanishPage();
		await page.goto(url('/auth/register'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text?.trim()).toBe(da.auth.register.title);
	});
});
