import { readFileSync } from 'node:fs';
import type { Plugin as RollupPlugin } from 'rollup';
import { defineNuxtConfig } from 'nuxt/config';

// Nitro's rollup pipeline lacks Vite's built-in `?raw` import suffix (its
// own raw plugin only handles a `raw:` prefix and a fixed extension list).
// The server i18n catalog (`server/utils/i18n.server.ts`) imports the YAML
// catalogs with `?raw`, so provide Vite-compatible `?raw` semantics to the
// Nitro build. The client/vitest side already supports `?raw` natively.
const RAW_QUERY = /\?raw$/;
const RAW_ID_PREFIX = '\0vite-compat-raw:';

const nitroRawCompatPlugin: RollupPlugin = {
	name: 'vite-compat-raw',
	async resolveId(source, importer, options): Promise<string | null> {
		if (!RAW_QUERY.test(source)) {
			return null;
		}
		const resolved = await this.resolve(
			source.replace(RAW_QUERY, ''),
			importer,
			options,
		);
		if (!resolved) {
			return null;
		}
		return `${RAW_ID_PREFIX}${resolved.id}`;
	},
	load(id: string): string | null {
		if (!id.startsWith(RAW_ID_PREFIX)) {
			return null;
		}
		const file = id.slice(RAW_ID_PREFIX.length);
		return `export default ${JSON.stringify(readFileSync(file, 'utf8'))}`;
	},
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2026-09-27',
	ssr: true,

	hooks: {
		'nitro:config': (nitroConfig) => {
			nitroConfig.rollupConfig ??= {};
			const existing = nitroConfig.rollupConfig.plugins;
			const existingPlugins = Array.isArray(existing)
				? existing
				: existing
					? [existing]
					: [];
			nitroConfig.rollupConfig.plugins = [
				...existingPlugins,
				nitroRawCompatPlugin,
			] as typeof nitroConfig.rollupConfig.plugins;
		},
		'prepare:types': ({ tsConfig }) => {
			const paths = tsConfig.compilerOptions?.paths;
			if (paths) {
				for (const [key, vals] of Object.entries(paths)) {
					paths[key] = vals.map((v: string) =>
						v === '.'
							? './'
							: v === '..'
								? '../'
								: v.startsWith('./') || v.startsWith('../')
									? v
									: `./${v}`,
					);
				}
			}
		},
	},

	modules: [
		'@nuxthub/core',
		'@nuxt/ui',
		'@nuxt/content',
		'@nuxtjs/i18n',
		'@nuxt/test-utils/module',
		'@sentry/nuxt/module',
	],

	future: {
		compatibilityVersion: 5,
	},

	experimental: {
		nitroAutoImports: true,
	},

	/**
	 * Options
	 */

	nitro: {
		preset: 'cloudflare_module',
		experimental: {
			tasks: true,
		},
	},

	vite: {
		optimizeDeps: {
			include: [
				'@vue/devtools-core',
				'@vue/devtools-kit',
				'date-fns',
				'@internationalized/date',
				'zod/v3',
				'zod/v4',
			],
		},
	},

	routeRules: {
		'/u': {
			redirect: {
				to: '/u/communal/book',
				statusCode: 302,
			},
		},
		'/u/admin': {
			redirect: {
				to: '/u/admin/users',
				statusCode: 302,
			},
		},
		'/u/system-admin': {
			redirect: {
				to: '/u/system-admin/logs',
				statusCode: 302,
			},
		},
		// English mirrors of the bare-index redirects above. Without them `/en/u`
		// would render the placeholder `u/index.vue` as a blank auth page.
		'/en/u': {
			redirect: {
				to: '/en/u/communal/book',
				statusCode: 302,
			},
		},
		'/en/u/admin': {
			redirect: {
				to: '/en/u/admin/users',
				statusCode: 302,
			},
		},
		'/en/u/system-admin': {
			redirect: {
				to: '/en/u/system-admin/logs',
				statusCode: 302,
			},
		},
	},

	runtimeConfig: {
		jwtSecret: process.env.NUXT_JWT_SECRET,
		vapidPrivateKey: process.env.NUXT_VAPID_PRIVATE_KEY,
		public: {
			vapidSubject: process.env.NUXT_PUBLIC_VAPID_SUBJECT,
			vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY,
			sentry: {
				dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
			},
		},
	},

	devtools: {
		enabled: true,
	},

	typescript: {
		typeCheck: true,
	},

	css: ['~/assets/css/main.css'],

	/**
	 * Modules
	 */

	hub: {
		db: {
			dialect: 'sqlite',
			driver: 'd1',
		},
		cache: {
			driver: 'cloudflare-kv-binding',
		},
	},

	content: {
		database: {
			type: 'd1',
			bindingName: 'DB',
		},
	},

	/**
	 * i18n (da default, en added). See `docs/` in the implementation brief:
	 * - all existing URLs stay unprefixed (Danish); `/en/*` is added on top
	 * - browser-language detection is OFF; the custom locale middleware in
	 *   `app/middleware/locale.global.ts` implements the resolution ladder
	 *   (cookie preference > logged-in userSettings > browser language > da)
	 */
	i18n: {
		baseUrl: 'https://hibiscusvej.dk',
		defaultLocale: 'da',
		strategy: 'prefix_except_default',
		locales: [
			{ code: 'da', language: 'da-DK', name: 'Dansk', file: 'da.yaml' },
			{ code: 'en', language: 'en', name: 'English', file: 'en.yaml' },
		],
		langDir: 'locales',
		detectBrowserLanguage: false,
		experimental: {
			typedOptionsAndMessages: 'default',
		},
	},

	// scan: true bundles literal icon usages from .vue/.md/etc. into the client bundle
	// for instant SSR. Icons in .ts files or built dynamically (e.g., `i-${name}`) are
	// NOT detected — extend scan.globInclude to add .ts/.js if icon names move there.
	icon: {
		clientBundle: {
			scan: true,
		},
	},

	sentry: {
		org: 'kristian-binau',
		project: 'hibiscusvej-web',
		authToken: process.env.SENTRY_AUTH_TOKEN,
	},

	sourcemap: {
		client: 'hidden',
	},
});
