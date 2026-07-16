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

## Growth roadmap after the repair deploy (priority order)

1. **Desk-fit acquisition kit** — turn calculator results into a branded printable one-pager for employees and remote-work stipend managers; include a shareable result URL and embed outreach template.
2. **Body-fit search cluster** — publish indexable desk-height and chair-height charts, chair seat-depth by height, and standing-desk picks for tall, short, and small-space users. Each page should route into the height calculator and a comparison page.
3. **Commercial comparison cluster** — Aeron vs Embody vs Leap, Branch vs FlexiSpot, Uplift vs FlexiSpot, monitor arms for thick desks, and cable management for standing desks. Link guide → tool → comparison → clearly disclosed CTA.
4. **Trust scorecards** — show research method, source links, scoring rubric, and spec or ASIN last-checked dates. Add a correction link instead of unsupported expert or tested language.
5. **Authentic setup gallery** — moderated user submissions with consent, budget, body-fit notes, and product list. Do not seed fictional profiles or counters.
6. **Per-page social cards** — unique OG art for calculators, comparisons, and the highest-impression guides to improve click-through when shared.
7. **Useful email lead magnet** — offer the saved desk-fit checklist and a weekly verified pick. Only promise a cadence the newsletter actually maintains.

## 30/60/90-day traffic plan

- **Days 1–30:** deploy repairs, fix apex redirect, resubmit sitemap, mark revenue events in GA4, establish Search Console baselines, and publish two body-fit pages.
- **Days 31–60:** publish four commercial comparison pages, create unique social cards for the top ten landing pages, and begin outreach for the embeddable height calculator.
- **Days 61–90:** launch the moderated setup gallery pilot, refresh pages using query and conversion data, and expand only clusters showing impressions or affiliate intent.

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
