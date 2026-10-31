import { defineCollection, defineContentConfig } from '@nuxt/content';

export default defineContentConfig({
	collections: {
		pages: defineCollection({
			type: 'page',
			source: 'pages/**',
		}),
		// English content lives alongside the Danish files (which stay
		// untouched); frontmatter `path` values are identical to the Danish
		// pages so the locale-aware catch-all can resolve both collections by
		// the same bare path.
		pages_en: defineCollection({
			type: 'page',
			source: { include: 'pages-en/**', prefix: '' },
		}),
		guide: defineCollection({
			type: 'page',
			source: 'guide/**.md',
		}),
	},
});
