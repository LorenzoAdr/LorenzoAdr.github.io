import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Guides synced from the tuide repository by scripts/sync-tuide-docs.mjs.
const tuideDocs = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/tuide-docs' }),
	schema: z.object({
		title: z.string(),
		summary: z.string(),
		order: z.number(),
		source: z.string(),
		commit: z.string(),
		updated: z.string(),
	}),
});

export const collections = { tuideDocs };
