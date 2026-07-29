import manifest from '../../assets/data/visual-manifest.json';

/**
 * Route → editorial artwork, resolved from the visual manifest.
 *
 * The manifest is the only place that decides which image belongs to a route,
 * and only `approved-production` masters resolve. Seven masters are byte-stub
 * placeholders wrongly marked approved in the past; `tests/visual-manifest.test.mjs`
 * keeps the status honest, and this module refuses to render anything else, so
 * a stub can never reach a page even if the status regresses.
 */
export interface VisualMaster {
  slug: string;
  routes: string[];
  approval: 'approved-production' | 'placeholder-pending-art';
  altText: string;
  focalPoint?: { desktop?: string; mobile?: string };
  variantDimensions?: Record<'desktop' | 'mobile', { width: number; height: number }>;
}

const masters = manifest.masters as VisualMaster[];

const normalizeRoute = (route: string): string => {
  const path = route.split('?')[0].split('#')[0].replace(/\.html$/, '');
  if (path === '' || path === '/') return '/';
  return path.replace(/\/+$/, '') || '/';
};

const byRoute = new Map<string, VisualMaster>();
for (const master of masters) {
  for (const route of master.routes) byRoute.set(normalizeRoute(route), master);
}

const isRenderable = (master?: VisualMaster): master is VisualMaster =>
  Boolean(master && master.approval === 'approved-production');

/** The artwork for a route, or undefined when none is approved for it. */
export const visualForRoute = (route: string): VisualMaster | undefined => {
  const master = byRoute.get(normalizeRoute(route));
  return isRenderable(master) ? master : undefined;
};

/** The artwork for an explicit master slug, honouring the same approval gate. */
export const visualBySlug = (slug?: string): VisualMaster | undefined => {
  if (!slug) return undefined;
  const master = masters.find((candidate) => candidate.slug === slug);
  return isRenderable(master) ? master : undefined;
};

export const variantSources = (master: VisualMaster) => {
  const base = `/assets/images/editorial/${master.slug}`;
  const desktop = master.variantDimensions?.desktop ?? { width: 1920, height: 1080 };
  const mobile = master.variantDimensions?.mobile ?? { width: 1080, height: 1350 };
  return {
    mobileAvif: `${base}-mobile.avif`,
    mobileWebp: `${base}-mobile.webp`,
    desktopAvif: `${base}-desktop.avif`,
    desktopWebp: `${base}-desktop.webp`,
    desktop,
    mobile,
  };
};
