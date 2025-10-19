import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-09-01',

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
		database: true,
		cache: true,
		blob: true,
		bindings: {
			compatibilityDate: '2025-09-01',
		},
	},

	content: {
		experimental: { sqliteConnector: 'better-sqlite3' },
	},
});
