// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-09-01',
	modules: [
		'@nuxthub/core',
		'@nuxtjs/seo',
		'@nuxt/ui',
		'@nuxt/content',
		'@nuxt/test-utils/module',
		'@compodium/nuxt',
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
		// Disable robots & sitemap
		'/u/**': { robots: false },
		'/auth/reset': { robots: false },
		'/board': { robots: false },
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
			compatibilityFlags: [],
		},
	},

	content: {
		experimental: { nativeSqlite: true },
	},

	site: {
		url: 'https://hibiscusvej.dk',
		name: 'Hibiscsuvej 2-30',
	},

	sitemap: {
		// Wait for SEO module to update to support Nuxt/Content v3.6.0
		enabled: false,
	},

	linkChecker: {
		// Wait for SEO module to update to support Nuxt/Content v3.6.0
		enabled: false,
	},

	ogImage: {
		enabled: false,
	},

	schemaOrg: {
		enabled: false,
	},
});
