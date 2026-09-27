import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2026-09-27',
	ssr: true,

	modules: [
		'@nuxthub/core',
		'@nuxt/ui',
		'@nuxt/content',
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

	hooks: {
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
