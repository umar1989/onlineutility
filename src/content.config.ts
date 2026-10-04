import { defineCollection } from 'astro/content/config';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
    primaryPhrase: z.string(),
    tool: z.string(), // slug of the matching tool
    published: z.coerce.date(),
    updated: z.coerce.date(),
  }),
});

export const collections = { guides };
