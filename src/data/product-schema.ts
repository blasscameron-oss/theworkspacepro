import { z } from 'astro/zod';

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  category: z.string().min(2),
  url: z.url(),
  price: z.number().nonnegative().optional(),
  priceBand: z.enum(['under-100', '100-300', '300-700', '700-plus']).optional(),
  desc: z.string().min(20),
  tiers: z.array(z.string()).default([]),
  bestFor: z.array(z.string()).min(1),
  asin: z.string().nullable().optional(),
  retailer: z.string().min(1),
  evidenceLevel: z.enum(['research', 'owned', 'hands-on']).default('research'),
  limitations: z.array(z.string()).default([]),
  verifiedAt: z.iso.date().optional(),
  image: z.string().nullable().optional(),
});

export const catalogSchema = z.object({
  version: z.number().int().positive(),
  updated: z.iso.date(),
  affiliateTag: z.literal('workspacepro-20'),
  products: z.array(productSchema).max(40),
});

export type Product = z.infer<typeof productSchema>;
