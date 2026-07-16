# Traffic growth ideas — The Workspace Pro

Honest site. No fake reviews. Free tools + research guides. Here’s what drives visits and how we’re set up.

## What already helps traffic

| Asset | Why people land / share |
|--------|-------------------------|
| Free 2‑min assessment | High completion intent; **shareable result links** (`/#assessment&r=…`) |
| Height + setup calculators | Evergreen “how tall should my desk be?” searches |
| Build Your Office | Budget planning tool people bookmark |
| Comparison pages | Head-to-head queries (Branch vs Uplift, etc.) |
| Guides (chairs, desks, mats) | Long-tail SEO; keep ASINs live |
| FAQ schema on homepage | Eligible for rich results |
| Guides `?q=` search | Matches WebSite SearchAction |

## Speed (ranking + conversion)

Already implemented or in progress:

- Fewer Google Font weights (Inter 400/600, Fraunces 500/700)
- `defer` on site JS; early theme script only in head
- Long-cache headers for `/assets/*`
- Prefetch internal links on hover (`perf-lite.js`)
- Lazy-load product images; `content-visibility` on sections
- Prefer local product thumbs (~few KB) over remote images

**Still good later:** compress `og-default.jpg` (largest image), optional WebP, reduce `enhancements.js` if unused features show low use, self-host fonts if CF bandwidth is cheap.

## Cool features shipped this pass

1. **Share results** — Web Share API + copy link (viral loop for remote-work chats)
2. **Product thumbs on quiz results** — visual, faster trust
3. **Sticky mobile quiz CTA** — recover scroll-away visitors
4. **Quick-tools chips** — internal links to money pages
5. **FAQ accordion + FAQPage schema** — honesty + SEO
6. **Prefetch on hover** — feels instant without SPA complexity

## Cool features to build next (priority order)

1. **Embeddable height calculator** — `/embed/height.html` for blogs (backlinks)
2. **“Desk fit” PDF one-pager** — print already works; brand it for HR/remote stipends
3. **Compare matrix tool** — filter chairs/desks by height range & budget (interactive)
4. **Weekly honest pick email** — Beehiiv; no fake discounts, just “what we updated”
5. **Guide TOC sticky + jump links** — dwell time
6. **PWA install / offline checklist** — optional, keep tiny
7. **Public changelog** — “ASINs verified July 2026” builds trust with power users

## Distribution (non-code)

- Post shareable quiz results to Reddit (r/HomeOffice, r/Ergonomics) **without spam** — lead with free tool
- Partner with remote-first companies for “stipend shopping list” landing page
- YouTube/shorts: 30s “are you sitting too low?” → height calc
- Update stale ASINs monthly (script + browser check already documented)

## Metrics that matter

- Quiz starts / completes (`assessment_complete` event)
- Shares (`assessment_share`)
- Affiliate click-outs (Amazon tag reports)
- Core Web Vitals in CF / Search Console
- Organic clicks to `/tools/`, calculators, top 5 guides

## Guardrails

- No fabricated testimonials or review stars
- Prices always “check live”
- Affiliate disclosure linked
- Medical disclaimers near pain content
