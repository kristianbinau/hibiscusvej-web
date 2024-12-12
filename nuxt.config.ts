// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-09-19',
	devtools: { enabled: true },
	modules: ['@nuxt/ui', '@nuxt/content', '@nuxthub/core'],
	ui: {
		global: true,
	},
	hub: {
		database: true,
	},
	nitro: {
		experimental: {
			tasks: true,
		},
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
	},
});
