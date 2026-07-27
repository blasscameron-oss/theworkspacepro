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
  // Marks the curated /deals value-pick shortlist. The deals page derives its
  // card list and "N value picks" count from products carrying this flag, so
  // membership lives in the catalog (single source) rather than the page.
  dealsShortlist: z.boolean().optional(),
});

export const catalogSchema = z.object({
  version: z.number().int().positive(),
  // Displayed to users as the catalog review date on /deals and the homepage.
  // Bump this ONLY when the product data below actually changes, and never
  // backdate it — every shown date must derive from a real revision.
  updated: z.iso.date(),
  affiliateTag: z.literal('workspacepro-20'),
  products: z.array(productSchema).max(40),
}).refine(
  (catalog) => new Set(catalog.products.map((product) => product.id)).size === catalog.products.length,
  { message: 'Product IDs must be unique', path: ['products'] },
).refine(
  // Catches the IKEA MARKUS class of duplicate: two ids pointing at the same
  // retailer listing. One URL must map to exactly one catalog entry.
  (catalog) => new Set(catalog.products.map((product) => product.url)).size === catalog.products.length,
  { message: 'Product URLs must be unique', path: ['products'] },
);

export type Product = z.infer<typeof productSchema>;
