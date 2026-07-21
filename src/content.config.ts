import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().min(20),
    description: z.string().min(70).max(170),
    category: z.enum(['body-fit', 'chairs', 'desks', 'monitors', 'lighting', 'setups']),
    intent: z.enum(['learn', 'solve', 'compare', 'buy']),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    author: z.string().default('The Workspace Pro Editorial Team'),
    methodology: z.string().min(20),
    sources: z.array(z.object({ label: z.string(), url: z.url() })).min(1),
    relatedTools: z.array(z.string()).default([]),
    relatedGuides: z.array(z.string()).default([]),
    canonical: z.string().startsWith('/guides/'),
    status: z.enum(['draft', 'review', 'published']).default('draft'),
    medicalDisclaimer: z.boolean().default(false),
    affiliateDisclosure: z.boolean().default(false),
  }),
});

export const collections = { guides };
