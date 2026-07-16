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
npx --yes serve -l 4173 .
# open http://localhost:4173
```

## Deploy

See **FINCH_HANDOFF.md** for full commit + upload steps. Short version:

```bash
git add -A
git commit -m "Improve Workspace Pro site UX and fixes"
git push origin HEAD
# optional worker: npx wrangler deploy
```

## Site map (key pages)

| Path | Purpose |
|------|---------|
| `/` | Assessment quiz + homepage |
| `/tools/` | Tools hub |
| `/guides/` | All guides (search + filter) |
| `/build-your-office/` | Interactive office builder |
| `/ergonomic-height-calculator/` | Body → desk/chair heights |
| `/workspace-setup-calculator/` | Layout planner |
| `/contact/` | Formspree contact |

## Affiliate

Amazon links use tag `workspacepro-20`. See `affiliate-disclosure.html`.
