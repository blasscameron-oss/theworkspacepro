# Controlled rebuild implementation

Updated: 2026-07-21

## What changed

The public site now builds through Astro while unfinished migrations continue to ship from the validated legacy files. Astro-generated routes win; `scripts/merge-legacy-public.mjs` copies remaining routes without overwriting migrated pages and generates the sitemap from canonical tags in the final artifact.

Migrated surfaces:

- Homepage shell and assessment presentation
- Guides library
- Shared header, footer, metadata, and article layout
- Five body-fit acquisition guides
- Printable desk-fit worksheet

The existing assessment, height math, analytics ID, affiliate tag, Cloudflare configuration, and canonical URLs are preserved.

## Commands

```bash
npm ci
npm run check
npm test
npm run test:e2e
```

`npm test` builds `dist`, validates all public HTML and links, checks analytics/assessment loading, exercises the height-math golden cases, and verifies the bounded affiliate catalog. Playwright covers desktop/mobile rendering, the assessment, mobile navigation, research disclosures, and worksheet input.

## Content contract

New guides live in `src/content/guides`. Their frontmatter is validated for category, intent, dates, methodology, authoritative sources, disclosures, canonical path, and publication status. Draft or review content is not emitted publicly.

The structured product catalog remains capped at 40 entries. The current 34 unique products should be verified or removed before adding breadth. Research-led recommendations must not be labeled hands-on.

## Deployment and rollback

Pushes to `main` install the lockfile, build the Astro/legacy artifact, validate it, and deploy `dist` to the existing Cloudflare Pages project. Pull requests run the browser-quality workflow.

Before merging:

1. Review the Cloudflare preview on desktop and a physical phone.
2. Verify assessment completion and a shared result URL.
3. Confirm the five new guides and worksheet appear in `dist/sitemap.xml`.
4. Confirm GA4 debug view records one page view and the expected events.

Cloudflare retains prior Pages deployments. If a production-only regression appears, roll back to the previous successful Pages deployment; do not change canonical URLs or delete redirects during rollback.

## Operator-owned growth work

Code cannot establish traffic baselines or earn backlinks automatically. After release, the site owner should:

- Record Search Console indexed pages, queries, impressions, clicks, and CTR.
- Submit `/sitemap.xml` and inspect the new cluster URLs.
- Mark assessment completion and affiliate click events as key events in GA4.
- Pitch the worksheet and height calculator to relevant remote-work, HR, and ergonomics resource pages.
- Review the first 30 days before commissioning another content cluster.
