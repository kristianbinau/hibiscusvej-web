import { z } from 'zod';
import { defineCollection, defineContentConfig } from '@nuxt/content';
import { asSitemapCollection } from '@nuxtjs/sitemap/content';

const BOARD_TYPES = ['chairman, member, deputy'] as const;

export default defineContentConfig({
	collections: {
		pages: defineCollection(
			asSitemapCollection({
				source: 'pages/**',
				type: 'page',
			}),
		),
		board: defineCollection({
			source: 'board/**.md',
			type: 'data',
			schema: z.object({
				type: z.enum(BOARD_TYPES),
				name: z.string(),
				termStartYear: z.number(),
				termEndYear: z.number(),
				links: z.array(
					z.object({
						label: z.string(),
						url: z.string(),
					}),
				),
				body: z.object({
					type: z.string(),
					children: z.any(),
					toc: z.any(),
				}),
			}),
		}),
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
