# Deployment handoff — The Workspace Pro

**Prepared:** 2026-07-21  
**Canonical repository:** `/home/cameron/.openclaw/workspace/theworkspacepro-v2`  
**Production:** `https://www.theworkspacepro.com`  
**Deploy target:** Cloudflare Pages project `the-workspace-pro` plus Worker `twp-monitor`

## Current release state

- `HEAD` and `origin/main` are both `d377688`; the release changes are local and uncommitted.
- Do not discard or reset the current worktree. Review every modified and untracked file before committing.
- This release adds four disclosed value picks to the home page, makes Deals discoverable from header/footer/guides/compare, adds a useful no-JavaScript fallback to Compare, adds buying-guide discovery and category-specific Deals links, strengthens assessment/catalog buying language, and expands contract/browser coverage for affiliate attribution and commercial surfaces.
- The product catalog has 34 unique products. Amazon links remain tagged with `workspacepro-20` and product counts are contract-tested.
- The Worker now covers the five body-fit guides and desk-fit worksheet, and verifies required body markers on Home, Deals, Guides, and Compare so a shell-only or corrupted HTTP 200 fails health.
- The existing component migration remains in scope: 45 built HTML pages, five body-fit guides, the desk-fit worksheet, calculators, assessment, comparisons, Deals, and legacy routes merged into the Astro artifact.
- Local verification on 2026-07-21 is green: `astro check` has 0 diagnostics; artifact validation passes 45 HTML/220 total files; all 10 Node tests pass (8 site-contract tests plus 2 monitor tests); the 20-test Playwright suite has 17 passes and 3 expected project-specific skips, including mobile `.table-wrap` containment and builder keyboard-focus progression across steps.
- Live read-only checks returned 200 for `/`, `/deals`, `/guides`, `/desk-fit-worksheet`, and `/sitemap.xml`. `/worker/monitor.js` returns 404 as intended. `/FINCH_HANDOFF.md` still returns a stale 200 and must be remediated under **Known limitations**.

## Production path and required configuration

The only supported production path is a push to `main`. `.github/workflows/deploy.yml` has a 35-minute timeout and a non-cancelling production concurrency group. It installs with Node 22, checks source JavaScript/corruption signatures, builds `dist`, runs Astro checks, the artifact validator, all Node tests, and desktop/mobile Playwright flows, then deploys Pages, deploys the Worker, and calls the authenticated production monitor. Do not manually run `wrangler pages deploy`, do not upload the repository root, and do not deploy from an older checkout.

The build merge allowlist skips `.orig`/`.rej` patch artifacts in copied legacy trees, and the artifact validator independently fails if either extension reaches `dist`.

Confirm these GitHub Actions secrets exist by **name only**:

- `CLOUDFLARE_API_TOKEN` — scoped for Pages and Worker deployment plus the configured KV binding
- `CLOUDFLARE_ACCOUNT_ID`
- `MONITOR_SECRET` — must match the Worker secret used by the authenticated health gate

The Worker also requires the existing `TWP_MONITOR` KV namespace binding from `wrangler.toml`. It runs Mondays at `0 14 * * 1` UTC and checks `https://www.theworkspacepro.com`.

**Never put secret values in this file, source, commits, screenshots, issue comments, terminal transcripts, or CI logs.** Store them only in GitHub Actions secrets/Cloudflare secrets or an ignored local secret file (`.env` and `.dev.vars` are ignored). Do not paste a secret into a command that will remain in shell history.

## Preflight

Run from the canonical repository:

```bash
cd /home/cameron/.openclaw/workspace/theworkspacepro-v2
git rev-parse --show-toplevel
git status --short --branch
git fetch origin
git rev-list --left-right --count origin/main...HEAD
git diff --check
npm ci
find assets/js worker -name '*.js' -print0 | xargs -0 -n1 node --check
npm run check
npm test
npm run test:e2e
```

Expected before committing: the canonical path above, no unexpected files, `origin/main...HEAD` reports `0 0`, no whitespace errors, 0 Astro diagnostics, the artifact validator passes, all 10 Node tests pass (8 site contracts and 2 monitor tests), and Playwright reports 17 passed/3 expected project-specific skips across 20 tests. If Chromium is not installed locally, run `npx playwright install chromium` once and repeat the browser suite.

Also inspect the release itself:

```bash
git diff --stat
git diff
git status --short
```

Stop if dependencies change `package-lock.json`, the branch has diverged, tests fail, affiliate URLs lose `tag=workspacepro-20`, or any credential-like value appears in the diff.

## Exact deployment steps

1. Stage the complete current release, including this handoff, then review every staged path and line. Do not use the old `FINCH_HANDOFF.md` as a deployment artifact; operational Markdown is excluded from `dist`.
2. Review the staged diff and commit on `main`.
3. Push once and watch the single deployment workflow through the authenticated health gate.

```bash
git add -A
git status --short
git diff --cached --check
git diff --cached --stat
git diff --cached
git commit -m "feat: improve deals discovery and buying guidance"
git push origin main
gh run list --workflow deploy.yml --limit 1
gh run watch RUN_ID --exit-status
```

Do not proceed to smoke testing until every workflow step succeeds. A failure after the Pages step may leave Pages updated while the Worker or health gate failed; diagnose the failed step and use a follow-up commit or the rollback below—never bypass CI.

## Post-deploy smoke checks

HTTP and security:

```bash
for path in / /deals /guides /desk-fit-worksheet /compare/ /ergonomic-height-calculator /embed/height /sitemap.xml; do
  curl -fsSIL -o /dev/null -w "%{http_code} %{url_effective}\n" "https://www.theworkspacepro.com${path}"
done
curl -sS -o /dev/null -w "%{http_code}\n" https://www.theworkspacepro.com/worker/monitor.js
curl -sI https://www.theworkspacepro.com/ | grep -i x-frame-options
curl -sI https://www.theworkspacepro.com/embed/height | grep -iE 'x-frame-options|content-security-policy'
```

Expect all public routes to terminate at 200, operational Worker source to return 404, the main site to send `X-Frame-Options: DENY`, and the height embed to omit that header and permit `frame-ancestors *`.

At desktop width and a 390 px viewport, verify:

- Home shows exactly four value-pick cards, clear affiliate disclosure, sponsored Amazon links with `tag=workspacepro-20`, and a working link to all 11 Deals picks.
- Deals filters/count/empty state work; `?category=chair&budget=under-200` restores state; price CTAs open valid live listings.
- Header, mobile menu, footer, Compare, guide library, and rebuilt guide follow-up sections expose the intended Deals links without overflow or focus regressions.
- Complete all nine assessment answers; shortlist copy says to verify live specifications/seller/condition/warranty/price, totals are estimates, and shared results restore.
- Desk-fit worksheet accepts measurements; height calculator and `/embed/height` work; a 69-inch input still yields 38.0-inch standing, 27.9-inch sitting, and 17.3-inch chair starting estimates.
- On mobile, wide guide tables stay contained within `.table-wrap` without page-level horizontal overflow.
- In the office builder, keyboard focus advances to the correct control or heading as the user moves between steps.
- A long guide's TOC scrolls normally, anchor targets clear the fixed header, and reading progress advances.
- No console errors, duplicate GA4 load, or `assessment.js` outside the home page.

The workflow already runs the secret-backed monitor. If an operator repeats it manually, load `MONITOR_SECRET` securely without echo/history, send it only as `X-Monitor-Key`, require HTTP success, and confirm JSON `failed` equals `0`. An unauthenticated 401 is expected for both a full run and `?action=latest`.

## Analytics and search follow-up

- In GA4 DebugView/Realtime, confirm one page view per navigation and exercise `assessment_start`, `assessment_complete`, `affiliate_click`, `deal_filter`, `deal_click`, `newsletter_click`, `newsletter_submit`, and `tool_action`. Confirm affiliate/deal payloads contain no private assessment answers.
- Confirm Cloudflare Web Analytics receives live page views and that its beacon is not blocked by CSP.
- After live verification, mark only owner-approved conversion events as GA4 key events; do not change event definitions during the deploy.
- In Google Search Console, submit `https://www.theworkspacepro.com/sitemap.xml`, confirm it is fetched successfully, inspect `/`, `/deals`, `/guides`, `/desk-fit-worksheet`, and the five body-fit guide URLs, and request indexing for materially updated/new canonical pages. Check Coverage/Pages and Enhancements again after crawling; do not request indexing for `/embed/height` (`noindex`) or operational files.
- Optionally repeat sitemap submission and URL checks in Bing Webmaster Tools.

## Rollback

Production is deliberately sequential, not atomic: Pages deploys first, then the Worker, then the authenticated monitor gate. Primary rollback is a recoverable Git revert through the same workflow, which restores both deploy targets in the supported order:

```bash
git log -5 --oneline
git revert RELEASE_COMMIT_SHA
git push origin main
gh run list --workflow deploy.yml --limit 1
gh run watch RUN_ID --exit-status
```

Re-run the HTTP/browser smoke checks after the revert. Do not reset `main`, force-push, delete deployments, or manually upload an older `dist`. If CI fails before the Pages step, fix and push; there is nothing to roll back. If Pages deploys but Worker deployment or the health gate fails, production is partially deployed: fix forward immediately or run the revert commands above and watch that workflow restore Pages and Worker.

## Known limitations and operator follow-up

- As checked 2026-07-21, `https://www.theworkspacepro.com/FINCH_HANDOFF.md` still returns stale HTTP 200 even though operational Markdown is absent from the current Pages artifact. In Cloudflare Dashboard, remove/bypass any broad custom-domain cache rule for that path, purge the stale object, and verify a 404. Do not redeploy manually to fix cache state.
- Production deployment is not atomic across Pages, Worker, and the final monitor gate; the workflow concurrency lock prevents overlapping production jobs but cannot make those external updates transactional.
- Browser flows run in `deploy.yml` before production as well as in the pull-request/manual `quality.yml`; retain the local browser preflight so failures are found before pushing.
- Amazon prices and availability are reference data and can change. Product imagery remains intentionally constrained; do not invent reviews/sale claims, substitute stock images for specific ASINs, or make scraping the permanent image source. Affiliate links must retain `workspacepro-20` and `rel="sponsored"`.
- The Amazon ASIN sample in the Worker is disabled to stay within the free Worker subrequest budget. Run the repository ASIN audit separately when needed; Amazon bot-wall results are warnings, not site-health failures.
- Search indexing, GA4 reporting latency, retailer availability, third-party Formspree/Beehiiv behavior, and CDN cache propagation are external and cannot be guaranteed by a successful build.

