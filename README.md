# The Workspace Pro

Ergonomic home-office site: free workspace assessment, calculators, and research-backed guides.

**Live:** [https://www.theworkspacepro.com](https://www.theworkspacepro.com)

**Deploy / commit handoff for Finch:** see [`FINCH_HANDOFF.md`](./FINCH_HANDOFF.md).  
**Approved polish roadmap:** [`DESIGN-polish-roadmap-7eaaef60.md`](./DESIGN-polish-roadmap-7eaaef60.md).

## Stack

- Astro-generated static HTML plus controlled legacy routes on **Cloudflare Pages**
- Weekly health monitor: **Cloudflare Worker** (`worker/monitor.js`) + KV
- Newsletter: **Beehiiv**
- Contact form: **Formspree**
- Analytics: GA4 + Cloudflare Web Analytics
- Site chrome: `assets/js/site.js` (theme + mobile menu)

## Local preview

```bash
npm run build
npm run validate
npx serve dist -l 4173 --no-clipboard
# open http://localhost:4173
```

## Tests

```bash
npm test          # build + validate public artifact + node --test tests/*.test.mjs
npx playwright test   # e2e flows + the contrast guard below
```

### Contrast guard

`tests/e2e/contrast.spec.mjs` fails the build if any text node on a key route
drops below WCAG AA (4.5:1, or 3:1 for large text). It walks every visible leaf
text node at 375px, resolves the nearest solid background, and diffs against the
threshold — it runs in the existing Playwright suite, so there is no extra CI
service to keep alive.

To see a full report (both themes, worst ratio first) against a running
`dist` server:

```bash
npm run build
npx serve dist -l 4331 --no-clipboard    # any static server on ./dist
node scripts/audit-contrast.mjs          # exits 1 if LIGHT theme has failures
```

The spec asserts the **light** theme only. Dark theme still has known failures,
so `scripts/audit-contrast.mjs` reports it but the test does not gate on it —
flip `themes` in the spec to `['light', 'dark']` once dark is cleared.

**When this test fails**, the cause is almost always one of two things:

1. A deliberately dark or saturated band (`.newsletter-bar`, `.cta-section`)
   getting repainted with page ink by a broad rule in a later stylesheet. Such a
   surface must publish `--surface-ink` / `--surface-ink-soft`; generic heading
   and prose rules read `var(--surface-ink, <page default>)` so the surface wins
   without a specificity fight.
2. A text token in `:root` drifting too light for the cream surfaces. Every step
   of the `--c-text` / `--c-text-light` / `--c-text-muted` ramp must clear 4.5:1
   against `#faf8f5`, `#ffffff`, `#f3efe9`, and `#f5f2eb`.

Fix the surface contract or the token, not the individual element.

## Deploy

See **FINCH_HANDOFF.md** for the full handoff. Production Pages and Worker deploys run through GitHub Actions after the allowlisted artifact passes validation:

```bash
git add -A
git commit -m "Improve Workspace Pro site UX and fixes"
git push origin HEAD
```

## Site map (key pages)

| Path | Purpose |
|------|---------|
| `/` | Assessment quiz + homepage |
| `/deals/` | Filterable, disclosure-first value picks |
| `/tools/` | Tools hub |
| `/guides/` | All guides (search + filter) |
| `/guides/desk-chair-height-chart/` | Imperial + metric desk/chair height reference |
| `/build-your-office/` | Interactive office builder |
| `/ergonomic-height-calculator/` | Body → desk/chair heights |
| `/workspace-setup-calculator/` | Layout planner |
| `/contact/` | Formspree contact |

## Public script surfaces

The Pages build copies an explicit JavaScript allowlist; adding a script to the repository does not publish it automatically.

| Script | Public surface |
|--------|----------------|
| `analytics.js` | Every public HTML page, exactly once |
| `assessment.js` | Homepage only |
| `deals.js` | `/deals/` filtering and click measurement |
| `compare-matrix.js` | `/compare/` filters |
| `height-math.js` | Full height calculator and height embed |
| `build-your-office.js` | Office builder |

## Affiliate

Amazon links use tag `workspacepro-20`. See `affiliate-disclosure.html`.
