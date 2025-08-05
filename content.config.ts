import { defineCollection, defineContentConfig } from '@nuxt/content';

export default defineContentConfig({
	collections: {
		pages: defineCollection({
			type: 'page',
			source: 'pages/**',
		}),
		guide: defineCollection({
			type: 'page',
			source: 'guide/**.md',
		}),
	},
});
