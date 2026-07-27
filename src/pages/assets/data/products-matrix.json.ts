import type { APIRoute } from 'astro';
import rawCatalog from '../../../../assets/data/catalog.json';
import { catalogSchema, type Product } from '../../../data/product-schema';

// The /compare matrix is DERIVED from the Zod-validated catalog at build time.
// This replaces the old hand-maintained products-matrix.json (which had drifted
// and carried duplicate rows). Because it parses the catalog through the same
// schema the deals page uses, a malformed catalog entry fails the build here.
const catalog = catalogSchema.parse(rawCatalog);

// Catalog category labels collapse into the coarser filter slugs the compare
// UI exposes (chair, desk, monitor, arm, lighting, input, accessory).
const CATEGORY_SLUG: Record<string, string> = {
  Chair: 'chair',
  Desk: 'desk',
  Monitor: 'monitor',
  'Monitor Stand': 'monitor',
  'Monitor Arm': 'arm',
  Lighting: 'lighting',
  'Keyboard Acc': 'input',
  Mouse: 'input',
  Accessory: 'accessory',
};

const budgetBand = (price: number | undefined): string => {
  if (price == null) return 'premium';
  if (price <= 150) return 'under-150';
  if (price <= 350) return 'under-350';
  if (price <= 600) return 'under-600';
  if (price <= 1000) return 'under-1000';
  return 'premium';
};

const toMatrixRow = (product: Product) => {
  const slug = CATEGORY_SLUG[product.category];
  if (!slug) throw new Error(`No compare category slug mapped for catalog category "${product.category}" (${product.id})`);
  return {
    id: product.id,
    name: product.name,
    category: slug,
    categoryLabel: product.category,
    price: product.price ?? null,
    budget: budgetBand(product.price),
    url: product.url,
    asin: product.asin ?? null,
    image: product.image ?? null,
    blurb: product.desc,
    retailer: product.retailer,
  };
};

const matrix = {
  version: catalog.version,
  updated: catalog.updated,
  filters: {
    category: ['all', 'chair', 'desk', 'monitor', 'arm', 'lighting', 'input', 'accessory'],
    budget: ['all', 'under-150', 'under-350', 'under-600', 'under-1000', 'premium'],
  },
  products: catalog.products.map(toMatrixRow),
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(matrix, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
