import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2026-01-18',

	ssr: false,

	modules: [
		'@nuxthub/core',
		'@nuxt/ui',
		'@nuxt/content',
		'@nuxt/test-utils/module',
	],

	/**
	 * Options
	 */

	nitro: {
		preset: 'cloudflare_module',
		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
		},
		experimental: {
			tasks: true,
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
	},

	runtimeConfig: {
		jwtSecret: process.env.NUXT_JWT_SECRET,
		vapidPrivateKey: process.env.NUXT_VAPID_PRIVATE_KEY,
		public: {
			vapidSubject: process.env.NUXT_PUBLIC_VAPID_SUBJECT,
			vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY,
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
			connection: { databaseId: '5fd56c7d-770c-413d-8ce5-8dc549df8989' },
		},
		cache: {
			driver: 'cloudflare-kv-binding',
			namespaceId: '4f2c15c5d6ee4546b6ba27f1c1e249f5',
		},
	},

	content: {
		database: {
			type: 'd1',
			bindingName: 'DB',
		},
		experimental: { sqliteConnector: 'better-sqlite3' },
	},
});
