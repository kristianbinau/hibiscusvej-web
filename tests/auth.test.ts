import { setup, createPage, url } from '@nuxt/test-utils/e2e';
import { describe, test, expect } from 'vitest';

describe('auth', async () => {
	await setup({
		host: 'http://localhost:3000',
	});

	test('login', async () => {
		const page = await createPage();
		await page.goto(url('/auth/login'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Login');
	});

	test('register', async () => {
		const page = await createPage();
		await page.goto(url('/auth/register'), { waitUntil: 'hydration' });
		const text = await page.textContent('h1');
		expect(text).toBe('Registér');
	});
});
