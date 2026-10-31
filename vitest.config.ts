import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { defineVitestProject } from '@nuxt/test-utils/config';

export default defineConfig({
	// Aliases used by the unit project: the server i18n module imports the
	// YAML catalogs via `~~/...?raw` and `#shared/constants` (`?raw` is
	// supported natively on the vitest/Vite side).
	resolve: {
		alias: {
			'~~': fileURLToPath(new URL('.', import.meta.url)),
			'#shared': fileURLToPath(new URL('./shared/', import.meta.url)),
		},
	},
	test: {
		projects: [
			{
				test: {
					name: 'unit',
					include: ['test/unit/*.{test,spec}.ts'],
					environment: 'node',
				},
			},
			{
				test: {
					name: 'e2e',
					include: ['test/e2e/*.{test,spec}.ts'],
					environment: 'node',
				},
			},
			await defineVitestProject({
				test: {
					name: 'nuxt',
					include: ['test/nuxt/*.{test,spec}.ts'],
					environment: 'nuxt',
				},
			}),
		],
	},
});
