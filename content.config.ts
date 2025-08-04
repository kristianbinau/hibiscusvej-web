import { z } from 'zod/v4';
import { defineCollection, defineContentConfig } from '@nuxt/content';
import { asSitemapCollection } from '@nuxtjs/sitemap/content';

export default defineContentConfig({
	collections: {
		pages: defineCollection(
			asSitemapCollection({
				source: 'pages/**',
				type: 'page',
			}),
		),
		guide: defineCollection({
			source: 'guide/**.md',
			type: 'data',
			schema: z.object({
				path: z.string(),
				body: z.object({
					type: z.string(),
					children: z.any(),
					toc: z.any(),
				}),
			}),
		}),
	},
});
