// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-12-12',
	modules: [
		'@nuxthub/core',
		'@nuxtjs/seo',
		'@nuxt/ui',
		'@nuxt/content',
		'@kristianbinau/nuxt-maintenance-mode',
	],

	// We only want to use the Sentry module in production
	$production: {
		modules: ['@sentry/nuxt/module'],
	},

	/**
	 * Options
	 */

	nitro: {
		experimental: {
			tasks: true,
		},
	},

	sourcemap: {
		// Used for Sentry
		client: true,
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
			// @ts-ignore
			maintenanceModeEnabled: process.env.NUXT_PUBLIC_MAINTENANCE_MODE_ENABLED,
			maintenanceModeBypassSecret:
				process.env.NUXT_PUBLIC_MAINTENANCE_MODE_BYPASS_SECRET,
		},
	},

	devtools: { enabled: true },

	typescript: {
		typeCheck: true,
	},

	/**
	 * Modules
	 */

	ui: {
		global: true,
	},

	hub: {
		database: true,
		cache: true,
		blob: true,
	},

	maintenanceMode: {
		include: ['/u*', '/auth*', '/api/app/*'],
	},

	content: {
		// @ts-ignore
		database: {
			type: 'd1',
			binding: 'DB',
		},
	},

	site: { url: 'https://hibiscusvej.dk', name: 'Hibiscsuvej 2-30' },

	ogImage: {
		enabled: false,
	},

	schemaOrg: {
		enabled: false,
	},
});
