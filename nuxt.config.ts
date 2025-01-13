// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-12-12',
	devtools: { enabled: true },
	modules: [
		'@nuxt/ui',
		'@nuxt/content',
		'@nuxthub/core',
		'@sentry/nuxt/module',
	],
	ui: {
		global: true,
	},
	hub: {
		database: true,
		cache: true,
	},
	nitro: {
		experimental: {
			tasks: true,
		},
	},

	sourcemap: {
		client: true,
	},

	experimental: {
		inlineRouteRules: true,
	},

	/**
	 * Waiting for fix in NuxtHub
	 * @see https://github.com/nuxt-hub/core/issues/293
	 */
	/*
	typescript: {
		typeCheck: true,
	},
	*/

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
});
