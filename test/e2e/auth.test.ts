import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { describe, test, expect } from 'vitest';

describe('auth', async () => {
	await setup({
		host: 'http://localhost:3000',
	});

	test('login', async () => {
		/**
		 * Navigate to Login, Validate Title
		 */

		const page = await createPage();
		await page.goto(url('/auth/login'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');

		expect(text).toBe('Login');

		/**
		 * Fill & Submit Form, Validate Response
		 */

		await page
			.getByRole('textbox', { name: 'Email' })
			.fill('kristian@binau.me');
		await page
			.getByRole('textbox', { name: 'Password' })
			.fill('kristian@binau.me');

		const loginResponsePromise = page.waitForResponse(
			url('/api/app/auth/login'),
		);
		await page.getByRole('button', { name: 'Login' }).click();
		const loginResponse = await loginResponsePromise;

		expect(loginResponse.status()).toBe(200);

		/**
		 * Wait for Redirect, Validate URL
		 */

		await page.waitForURL(url('/u/communal/book'));
		expect(page.url()).toBe(url('/u/communal/book'));

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
		const page = await createPage();
		await page.goto(url('/auth/register'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Registér');
	});
});
