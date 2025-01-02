// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-12-12',
	devtools: { enabled: true },
	modules: ['@nuxt/ui', '@nuxt/content', '@nuxthub/core'],
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
		jwtPrivateKey: process.env.NUXT_JWT_PRIVATE_KEY,
		vapidPrivateKey: process.env.NUXT_VAPID_PRIVATE_KEY,
		public: {
			jwtPublicKey: process.env.NUXT_PUBLIC_JWT_PUBLIC_KEY,
			vapidSubject: process.env.NUXT_PUBLIC_VAPID_SUBJECT,
			vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY,
		},
	},
});
