# The Workspace Pro

Ergonomic home-office site: free workspace assessment, calculators, and research-backed guides.

**Live:** [https://www.theworkspacepro.com](https://www.theworkspacepro.com)

**Deploy / commit handoff for Finch:** see [`FINCH_HANDOFF.md`](./FINCH_HANDOFF.md).  
**Approved polish roadmap:** [`DESIGN-polish-roadmap-7eaaef60.md`](./DESIGN-polish-roadmap-7eaaef60.md).

## Stack

- Static HTML/CSS/JS on **Cloudflare Pages**
- Weekly health monitor: **Cloudflare Worker** (`worker/monitor.js`) + KV
- Newsletter: **Beehiiv**
- Contact form: **Formspree**
- Analytics: GA4 + Cloudflare Web Analytics
- Site chrome: `assets/js/site.js` (theme + mobile menu)

## Local preview

```bash
./scripts/build-for-pages.sh dist
node scripts/validate-public-site.mjs dist
npx --yes serve -l 4173 .
# open http://localhost:4173
```

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
