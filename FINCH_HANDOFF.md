# Finch handoff — The Workspace Pro

**Updated:** 2026-07-18 (final audit sweep complete locally; repair release awaits Finch deploy)
**Canonical path:** `/home/cameron/.openclaw/workspace/theworkspacepro-v2`
**Live:** https://www.theworkspacepro.com
**GitHub:** `https://github.com/blasscameron-oss/theworkspacepro`
**Hosting:** Cloudflare Pages (static) + required health Worker `twp-monitor`

## ⚠️ STATUS (2026-07-18): v2 is live; final audit repair release is NOT deployed

The live site matches the v2 checkout and commit `668dff9`. The new Luna audit found and repaired several production-critical defects locally: a nonfunctional setup calculator, skipped assessment questions, incorrect product mappings, redirect loops, leaked generator code in guides, malformed analytics markup, weak deployment boundaries, and trust/compliance issues.

**Finch must review, commit, push, and verify this repair release.** Do not deploy from the older `repos/workspace-pro-minimal` checkout. The authoritative checkout is the canonical path above.

### ⏰ OWNER REMINDER — follow up TOMORROW

**Cameron:** Enable / apply for official **Amazon Creators API** (successor to Product Advertising API — PA-API deprecated May 2026). ⚠️ Requires **10+ qualified sales in past 30 days**. Then hand credentials to Finch (or set secrets) so Finch can implement **§ Amazon product images (API build plan)** below.

| Doc | Purpose |
|-----|---------|
| `DESIGN-polish-roadmap-7eaaef60.md` | Approved design + PR plan |
| `TRAFFIC_GROWTH.md` | Growth / SEO ideas |
| `scripts/ASIN_RUNBOOK.md` | Monthly affiliate health |
| **This file § Amazon product images** | **API build plan when keys arrive** |

---

## What this site is

| Surface | Role |
|---------|------|
| `/` | Assessment quiz (**only** page with `assessment.js`) |
| `/tools` | Tools hub + height embed snippet |
| `/embed/height` | Embeddable height calc (`noindex`) |
| `/compare/` | **Filter matrix** (query-shareable) |
| `/compare/*` | Long-form written comparisons |
| `/build-your-office` | Budget builder |
| `/ergonomic-height-calculator` | Full height tool + `height-math.js` |
| `/workspace-setup-calculator` | Setup planner |
| `/guides` | 16 guides + search |
| `/changelog` | Honest ship log |
| Contact / Newsletter | Formspree / Beehiiv |
| Affiliate | Amazon tag **`workspacepro-20`** |
| Analytics | **`/assets/js/analytics.js`** only → GA4 `G-2DWRW4PE8Y` |
| Fonts | **Self-hosted** `/assets/css/fonts.css` + `/assets/fonts/*.woff2` |

**Guardrails:** No fake testimonials, no fabricated stars, no invented sale prices.

---

## Design plan status — ALL PRs

| PR | Title | Status |
|----|--------|--------|
| PR1 | `assessment.js` only on `index.html` | ✅ |
| PR1b | Sitewide `analytics.js`, no double GA | ✅ |
| PR2 | Mobile a11y (`aria-expanded`, focus return) | ✅ |
| PR3 | `.result-total` + guide `--c-*` tokens | ✅ |
| PR4 | OG compress (~44KB) + img dimensions | ✅ |
| PR5 | Gate `enhancements.js` by page type | ✅ |
| PR6 | ASIN inventory + denylist + runbook | ✅ |
| PR7 | Extra product images (BenQ retry optional) | ✅ (most matrix thumbs present) |
| PR8 | `/embed/height` + header detach | ✅ |
| PR9 | Branded print CSS | ✅ |
| PR10 | Sticky guide `.toc` | ✅ |
| PR11 | `/compare/` matrix + JSON data | ✅ |
| PR12 | `catalog.json` + optional JS load | ✅ |
| PR13 | Monitor ASIN sample | ⏸ Disabled to keep the free Worker below its subrequest limit |
| PR14 | `/changelog` + sitemap + monitor | ✅ |
| PR15 | OSHA/BIFMA source notes (index + about) | ✅ |
| PR16 | Self-hosted Inter + Fraunces woff2 | ✅ |

Local verify (2026-07-18): JavaScript syntax PASS; all 37 public HTML files have one H1, one main landmark, and a valid skip target. The 64-file allowlisted Pages artifact excludes operational files and unapproved thumbnails; Wrangler parses 26 valid redirect rules and 8 header rules. A 390px preview sweep returned HTTP 200 for all 36 audited public routes, with no horizontal overflow on the repaired guide table, long comparison CTA, or height embed.

---

## Script allowlist

| Script | Where |
|--------|--------|
| `assessment.js` | **`index.html` only** |
| `analytics.js` | All public HTML (once) |
| `site.js` + `perf-lite.js` | Site chrome |
| `height-math.js` | Height full tool + embed |
| `compare-matrix.js` | `/compare/` only |
| `build-your-office.js` | BYO only |
| `fonts.css` | All pages (replaces Google Fonts) |

Data:

- `assets/data/products-matrix.json` — compare UI
- `assets/data/catalog.json` — product export / optional runtime load

---

## Headers (Cloudflare Pages)

- Global: CSP (self fonts/styles), `X-Frame-Options: DENY`, asset cache
- **`/embed/*`:** detach with `! X-Frame-Options` and `! Content-Security-Policy`, then re-set CSP with **`frame-ancestors *`**

---

## Smoke tests (post-deploy)

### Perf / scripts
- [ ] Guide Network: **no** `assessment.js`; loads `fonts.css` / woff2 from **self**
- [ ] Home: one `assessment.js`, one `analytics.js`, no second gtag config
- [ ] CSP does not need `fonts.googleapis.com` (self-hosted)

### Features
- [ ] `/compare/?category=chair&budget=under-350` filters restore
- [ ] Matrix Amazon links include `tag=workspacepro-20`
- [ ] Quiz share link restores results in private window
- [ ] `/embed/height` works in iframe; full tool UTM link works

### Headers
```bash
curl -sI https://www.theworkspacepro.com/ | grep -i x-frame   # expect DENY
curl -sI https://www.theworkspacepro.com/embed/height | grep -i x-frame  # expect empty
curl -sI https://www.theworkspacepro.com/embed/height | grep -i content-security  # frame-ancestors *
```

### Ops
```bash
python3 scripts/check_asins_site.py --fail-on-denylist
node -e "eval(require('fs').readFileSync('assets/js/height-math.js','utf8')); console.log(TWPHeightMath.selfTest())"
```

---

## Height math (frozen)

| Output | × body height (inches) |
|--------|-------------------------|
| Standing desk | 0.55 |
| Sitting desk / keyboard | 0.27 |
| Chair | 0.25 |
| Monitor top | 0.93 |
| Monitor distance | clamp(h×0.33, 18–28) |

Golden: 69 in → metric standing intermediate **96.4 cm**.

---

## Affiliate / ASIN

- Tag: **`workspacepro-20`**
- Denylist: `B0B7865Z11` (bimini), `B09RK8XWJB` (mural)
- Monthly: `scripts/ASIN_RUNBOOK.md`
- Soft Amazon checks in Worker: **warnings only**, never hard-fail

---

## Amazon product images — policy + API build plan

> **Priority follow-up for Cameron (tomorrow):** get official API access for Associates product images.
> **Priority for Finch (when credentials arrive):** implement the pipeline below. Do **not** “fix” images with Unsplash/stock lookalikes or more browser scrapes of `m.media-amazon.com` as the long-term system.

### Why this is important

Wrong or non-compliant product photos:

- Break trust (user sees product A, clicks product B)
- Risk **Associates / API license** issues if Amazon product photography is used outside approved channels
- Go stale when Amazon changes the main image

**Do not use generic stock photos** of “an office chair” on a specific ASIN link. Empty placeholder + “View on Amazon” is better than a lookalike.

### What is OK vs not OK

| Approach | Verdict |
|----------|---------|
| Official **Amazon Creators API** / Associates product API image fields | ✅ Correct long-term path |
| SiteStripe / official Associate embed tools (manual, small scale) | ✅ OK if still offered for the account |
| Your own photos of gear you own | ✅ Always OK |
| Brand press kits (Branch, Uplift, etc.) with permission | ✅ For non-Amazon SKUs |
| Honest placeholder (icon + name + CTA) until API image exists | ✅ Temporary OK |
| Scraping product pages / saving CDN JPGs by hand as permanent source of truth | ⚠️ Temporary scaffolding only — replace with API |
| Generic stock “ergonomic chair” on a specific ASIN | ❌ Never |
| Reusing one product’s photo for a different ASIN | ❌ Never |

### Current site state (as of handoff)

- Legacy local files remain in the repository for provenance review, but the allowlisted Pages build does not deploy either product-image directory.
- Guides, assessment results, matrix, and catalog no longer reference those files; public product cards use text/icon presentation.
- Restore Amazon imagery only from an authorized API/embed source or documented licensed assets.

### Owner steps (Cameron)

**Prerequisite:** Associates account must have **10+ qualified sales in the past 30 days**. Without this, the Creators API tab won't appear in your dashboard.

1. Log into **Amazon.com** → Your Account → Your Associates Account (or go to `amazon.com/associates`). The old `affiliate-program.amazon.com` URLs may redirect unpredictably per region.
2. In Associates Central, go to **Tools → Product Advertising API** (may show as "Creators API" or "API Credentials").
3. If you don't see the Tools tab or API option, you haven't met the 10-sale threshold yet. No way around it — focus on driving qualified sales first.
4. Once accessible, create API credentials (**Access Key**, **Secret**, **Partner Tag** = `workspacepro-20`, marketplace `www.amazon.com` / locale `US`).
5. **Never commit secrets to git.** Give Finch secrets via:
   - Cloudflare Workers secrets / Pages env, and/or
   - Local `.env` (gitignored) for a one-shot sync script
6. Tell Finch: "API credentials are set — run Amazon images pipeline."

### Finch build plan when API arrives

Implement as **one focused PR** (or PR stack): `feat: Amazon Creators API product image sync`.

#### Architecture (target)

```
ASIN list (scripts/check_asins_site.py inventory
         + assets/data/catalog.json)
        │
        ▼
sync job (Node or Python CLI, or CF Worker cron)
  - GetItems / equivalent Creators API call
  - Pull: title, primary image URL(s), detail URL, optional price
        │
        ▼
assets/data/catalog.json  (imageUrl from Amazon CDN or allowed cache)
assets/data/products-matrix.json  (same)
optional: refresh guide primary-pick metadata only if automated safely
        │
        ▼
Frontend: quiz / matrix / guides read imageUrl from catalog
  - Prefer API image URL (Amazon-hosted) if license allows
  - Placeholder if missing
  - Stop depending on hand-scraped local JPGs long-term
```

#### Step-by-step implementation

**1. Secrets & config (no secrets in repo)**

- Add `.env.example` (values blank):
  ```
  AMAZON_ACCESS_KEY=
  AMAZON_SECRET_KEY=
  AMAZON_PARTNER_TAG=workspacepro-20
  AMAZON_HOST=webservices.amazon.com
  AMAZON_REGION=us-east-1
  AMAZON_MARKETPLACE=www.amazon.com
  ```
- Ensure `.env` is in `.gitignore`.
- For production sync: `wrangler secret put …` on a Worker, or run sync only on owner machine and commit **JSON outputs only** (image URLs, not keys).

**2. ASIN source of truth**

```bash
python3 scripts/check_asins_site.py
# reads scripts/asin_inventory.json → unique ASINs sitewide
```

Also read `assets/data/catalog.json` products with `asin` set. Merge + unique. Skip denylist (`scripts/asin_denylist.json`).

**3. New script: `scripts/sync_amazon_catalog.py` (or `.mjs`)**

Responsibilities:

1. Load ASINs from inventory + catalog.
2. Batch API requests (respect rate limits; e.g. chunks of 10 ASINs).
3. For each item, extract:
   - `asin`
   - `title` (optional sanity check vs our `name`)
   - `imageUrl` (primary large image from API response)
   - `detailPageUrl` (must still include / preserve `tag=workspacepro-20` on outbound links)
4. Write/update:
   - `assets/data/catalog.json` → each product: `"imageUrl": "https://…"` (API URL), `"imageSource": "amazon-api"`, `"imageSyncedAt": ISO date`
   - `assets/data/products-matrix.json` → same `image` / `imageUrl` field
5. Log mismatches (API title very different from our name → warning, do not auto-overwrite name without review).
6. Exit non-zero if denylisted ASIN appears or API auth fails.

**Do not** invent images when API returns nothing — leave `imageUrl: null`.

**4. Frontend consumers (in order)**

| Surface | File(s) | Change |
|---------|---------|--------|
| Compare matrix | `assets/js/compare-matrix.js` | Prefer `p.imageUrl \|\| p.image`; on error / null → placeholder tile (no stock photo) |
| Quiz results thumbs | `assets/js/assessment.js` | Prefer catalog `imageUrl` if `__TWP_CATALOG__` loaded; else local `/assets/images/products/{ASIN}.jpg` if exists; else icon only |
| Build Your Office | `assets/js/build-your-office.js` | Same pattern if product cards show images |
| Guides | `guides/*.html` | Longer term: inject from catalog or keep manual; **do not** scrape new local JPGs |

Placeholder HTML pattern (honest):

```html
<div class="product-thumb product-thumb--empty" aria-hidden="true">📦</div>
```

**5. Caching policy**

- **Preferred:** use **Amazon CDN image URLs** returned by the API (no re-host), if license allows.
- **Only cache to disk** (`assets/images/products/{ASIN}.jpg`) if the API license explicitly permits offline/cache use; document that in script header.
- If re-hosting is not allowed, delete reliance on scraped JPGs gradually (keep files only as fallback until all pages read `imageUrl`).

**6. Non-Amazon products (Branch, IKEA, Uplift, Fully…)**

- Do **not** pull from Amazon API.
- Options: brand asset (with permission), own photo, or placeholder.
- Matrix already has ~10 non-Amazon rows — leave without Amazon photos.

**7. Worker / CI (optional later)**

- Do **not** hard-fail site health on Amazon image 404s.
- Optional: monthly GitHub Action runs `sync_amazon_catalog` with secrets → opens PR with JSON diff only.
- The soft ASIN sample is disabled in the free Worker; run it separately only when the subrequest budget allows.

**8. Acceptance criteria (Finch smoke after API PR)**

- [ ] Secrets not in git (`git grep -i secret` clean of real keys)
- [ ] `sync_amazon_catalog` succeeds for ≥ sample of 10 ASINs
- [ ] `/compare/` shows real API images for Amazon rows; placeholders for missing
- [ ] Quiz results show thumbs only when `imageUrl` or verified local file exists
- [ ] No stock/Unsplash product photos on ASIN links
- [ ] Outbound Amazon URLs still have `tag=workspacepro-20`
- [ ] Denylist ASINs never requested

**9. Rollback**

- Revert frontend to local path / placeholder if API outage.
- Catalog keeps last good `imageUrl`; do not wipe on failed sync.

### Interim (until API is live)

- Ship the release-safe text/icon product presentation; local Amazon thumbnails are excluded from Pages.
- Prefer **placeholder** over new scrapes.
- Owner enables API tomorrow → Finch runs this section.

---

## 2026-07-18 audit repair — Finch deployment checklist

### What changed

- Repaired workspace-setup-calculator.html malformed product JavaScript; recommendations and affiliate CTAs parse again.
- Changed the homepage assessment to explicit validated navigation so all 9 answers are collected; corrected chair, lighting, and accessory mappings; validated shared-result payloads.
- Removed leaked getBadgeColumnForRow generator code and malformed newsletter fragments from affected guides.
- Removed unproven Amazon thumbnails from public output until authorized API assets are available; removed the fake local-only price alert and corrected unsupported “Tested & Ranked” claims to research-based language.
- Added the exact Amazon Associates disclosure, accurate assessment privacy copy, and GA4 events for affiliate clicks, newsletter actions, quiz starts, and tool actions.
- Fixed Cloudflare beacon JSON quoting and malformed metadata heads across public HTML; filled missing Open Graph URLs.
- Removed the three redirect rules that looped tools, embed/height, and changelog. Canonicals, sitemap entries, internal links, and old redirect targets now use terminal no-slash URLs; compare remains a real directory URL.
- Made mutable asset caches revalidate.
- Hardened the monitor: authenticated runs fail closed, query-string secrets are gone, redirect loops fail, terminal 200 is required, and the check uses 28 planned URLs and at most 32 external subrequests.
- CI now validates JavaScript, corruption signatures, and malformed meta heads, builds an allowlisted dist that excludes operational files and unproven Amazon thumbnails, deploys Pages from dist, deploys the Worker, and runs an authenticated health gate. Operational docs, scripts, Worker source, and handoff notes are no longer published as site files.
- Final release sweep: contained wide guide tables with horizontal scrolling, made long mobile CTAs wrap safely, gave every long-form guide and the height embed a real main landmark and skip-link target, removed the unsupported absolute apex rule from Pages redirects, and ignored the generated _site build directory.

### One-time owner/dashboard setup before push

1. In Cloudflare Workers, set MONITOR_SECRET for twp-monitor with npx wrangler secret put MONITOR_SECRET; use a long random value.
2. Add the same value as GitHub Actions secret MONITOR_SECRET. Existing Cloudflare API token and account ID secrets must remain available.
3. In Cloudflare Redirect Rules, fix the apex-host rule:
   - Match: http.host eq "theworkspacepro.com"
   - Dynamic target: concat("https://www.theworkspacepro.com", http.request.uri.path)
   - Preserve the query string.
   The current apex rule drops path and query, so theworkspacepro.com/sitemap.xml incorrectly lands on the homepage.

### Commit and deploy

    cd /home/cameron/.openclaw/workspace/theworkspacepro-v2
    git status --short
    git diff --check
    find assets/js worker -name "*.js" -print0 | xargs -0 -n1 node --check
    ./scripts/build-for-pages.sh
    git add -A
    git commit -m "fix: complete accessibility and mobile release sweep"
    git push origin main

The push deploys Pages first, then the monitor, then runs the authenticated smoke check. A smoke failure stops CI but does not automatically roll back an already-live Pages deployment. Do not manually run pages deploy from the repository root; that republishes private repository files.

### Production acceptance checks

    curl -fsSIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://www.theworkspacepro.com/tools
    curl -fsSIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://www.theworkspacepro.com/embed/height
    curl -fsSIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://www.theworkspacepro.com/changelog
    curl -fsSIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://www.theworkspacepro.com/workspace-setup-calculator
    curl -fsSIL -o /dev/null -w '%{http_code} %{url_effective}\n' https://theworkspacepro.com/sitemap.xml
    curl -sS -o /dev/null -w '%{http_code}\n' https://www.theworkspacepro.com/FINCH_HANDOFF.md
    curl -sS -o /dev/null -w '%{http_code}\n' https://www.theworkspacepro.com/worker/monitor.js
    curl --fail --silent --show-error --header "X-Monitor-Key: YOUR_SECRET" --output /tmp/twp-monitor.json https://twp-monitor.blasscameron.workers.dev
    node -e "const r=require('/tmp/twp-monitor.json'); if(r.failed!==0){console.error(r);process.exit(1)}; console.log(r)"

Expected: public pages end at HTTP 200 without loops; apex sitemap preserves the path; handoff and Worker source return 404; monitor returns JSON with failed equal to 0. In a browser, complete all 9 assessment answers, verify Night Owl recommends a BenQ light, run the workspace setup calculator, open and close the mobile menu by keyboard, and inspect GA4 DebugView for assessment_start, affiliate_click, newsletter_click, and tool_action.

After deploy, resubmit the sitemap in Google Search Console and Bing Webmaster Tools. Mark affiliate and newsletter events as GA4 key events after confirming live traffic.

## Follow-ups

### ⏰ Tomorrow (owner + Finch)

1. **Cameron:** Associates → Creators / product API credentials + partner tag `workspacepro-20`.
2. **Finch:** Implement **§ Amazon product images — Finch build plan** (above).

### Other optional polish

- PR11 UX: sort by price, more deep-links from guide CTAs
- Real citation links for any remaining soft claims in older guide prose
- CWV measure after deploy; further font subsetting only if needed

---

## Do not

- Re-add `assessment.js` sitewide
- Double-load GA4
- Invent reviews / sale theater
- **Use stock photos for specific Amazon ASINs**
- **Scrape Amazon product images as the permanent image system**
- Hard-fail health checks on Amazon bot walls
- Commit API keys / secrets
- Force-push without owner approval
