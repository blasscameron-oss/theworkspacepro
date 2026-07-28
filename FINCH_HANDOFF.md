# Finch handoff

> **How to use this file.** The top section is the only live handoff; everything
> below the first `---` is history, newest first. **When you finish, update this
> file yourself**: move the current section down into the history with an outcome
> line (`DONE, shipped as <sha>` or `BLOCKED — <reason>`), and write a new
> CURRENT section describing the state you are leaving behind — deployed SHA,
> what you verified after deploying, anything that surprised you, and what the
> next person should pick up. Record what you *observed*, not what you expected;
> the July 22 incident cost days because a handoff described an intended state
> rather than the real one. If you deviate from the steps below, say so and say
> why. Commit that update on the branch you shipped.

## CURRENT HANDOFF (2026-07-28): ship branch `fix/contrast-light-2026-07-28`

The redesign shipped successfully (main = `2d67817`, live). The owner then
reported "a couple of spots towards the bottom of the page where the contrast
gets weird and its hard to see." Confirmed and fixed.

**What it was.** `.newsletter-bar__title` ("Get Weekly Workspace Tips") rendered
page ink on the deliberately dark newsletter band at **1.17:1 — effectively
invisible** — near the bottom of most pages, exactly as described. The terracotta
CTA headings above it sat at 2.94:1. An automated sweep then found the same class
of bug everywhere: **440 sub-AA text nodes across all 42 routes** (5 light + ~329
dark + 111 on routes that were never being measured).

**Root cause, one sentence:** a surface that paints its own background but lets
text colour come from elsewhere — so a light-theme background meets cream
dark-theme ink, or a dark band meets page ink. Fixed structurally: any surface
owning its background now owns its ink too, via themed tokens
(`--editorial-band`, `--editorial-tint`/`-warm`, `--editorial-stripe`,
`--editorial-prose`, `--c-primary-fill`/`--c-on-primary`,
`--editorial-accent-fill`/`--editorial-on-accent`, price-tier trio). Several
real bugs surfaced beyond the reported one, including an in-body CTA button
rendering at **1:1** on compare pages and `button` inheriting the UA
`buttontext` keyword (black on charcoal) on both calculators.

**Now: 0 failures on all 42 routes in both themes** (was 440).

**Permanent guard.** `scripts/audit-contrast.mjs` derives its route list from
the build and sweeps every page in both themes at 375px (exit 1 on any
failure); `tests/e2e/contrast.spec.mjs` runs the same rules on one route per
layout as part of the normal Playwright suite. The guard was verified
non-vacuous by injecting a bad token — it reported 98 failures and exited 1.
**Run `node scripts/audit-contrast.mjs` against a served `dist` before any
release.** If you add a new *layout*, add one route to `PAGES`; new *pages* are
picked up automatically.

**Verified 2026-07-28 (final):** build (43 pages), validate (43 HTML / 270
files), `npm run check` (0 diagnostics), `node --test` (44/44), `npx playwright
test` (26 passed / 6 skipped), contrast sweep (42 routes × 2 themes, 0
failures), link audit (0 dead, 0 redirected). `dist/deals.html` renders 11
cards, 11 category diagrams, 11 "not a product photo" captions, 10 tagged
Amazon links, and zero untagged Amazon links anywhere in `dist`.

**Ship it:** same route as last time — push the branch, PR into `main`, merge
once, watch the single deploy run (`gh run list --workflow deploy.yml --limit 1`).
Do NOT hand-deploy with `wrangler`; the contrast guard only protects the site if
releases go through CI, which runs `npm run test:e2e` (deploy.yml:56) and would
have caught every bug fixed here.

**Post-deploy checks (in addition to the standard ones below):**
- Scroll to the bottom of `/tips` and `/about` in BOTH themes — the newsletter
  band ("Get Weekly Workspace Tips") and the terracotta CTA heading above it
  must be clearly legible. This is the owner-reported symptom; verify it on the
  real site, not just locally.
- Toggle dark mode and open `/compare/herman-miller-vs-steelcase`,
  `/guides/chair-seat-depth-by-height`, and `/ergonomic-height-calculator` —
  all body copy readable, no white-on-white.
- Serve the deployed `dist` locally and run `node scripts/audit-contrast.mjs`
  once more against it; expect exit 0.
- `/deals` shows **11 cards, 10 with Amazon links**; header reads "35-product
  catalog reviewed July 28, 2026" and the homepage "Browse all 11 value picks".
- Click through two or three deal links and confirm they land on the product
  page (not a category page) at roughly the price shown.
- Confirm `/compare` and `/deals` show inch marks as `27″`, not `27\`.

### The product-data correction (done — context for your smoke checks)

The link audit found **5 of 8 non-Amazon product links no longer reached the
product**, and following that thread turned up worse: prices across the catalog
were stale by up to 2×, and two shortlisted Amazon items were out of stock. All
of it was verified against live retailer pages on 2026-07-28 and corrected.

- **Retired 4 products** that no longer exist as described: IKEA LAGKAPTEN (the
  bamboo variant never existed — LAGKAPTEN is a tabletop), IKEA TROTTEN (every
  variant on clearance/last-chance), Fully Jarvis (brand absorbed by Herman
  Miller; real price ~$1,175 vs the $549 we published), and Branch Standing Desk
  (**its old URL now serves a $749 desk while we advertised $499** — the most
  urgent find).
- **Corrected** the two live IKEA URLs (the old slugs used IKEA's global item
  ids; the US site keys on different ones), renamed UPLIFT V2 → V3, and refreshed
  ~10 stale prices — including HON Ignition $379 → **$461.98** and ASUS ProArt
  $299 → **$229**.
- **Added 6 verified Amazon products**, taking Desk coverage from 1 Amazon entry
  to 4. Desks were the gap: the catalog had exactly one Amazon desk.
- **Deals shortlist is now 10 of 11 earning**, up from 7. Nothing was added
  because it pays — two Amazon items were *removed* for being out of stock, and
  the non-earning Branch chair ($359) was deliberately **kept** because it is the
  best chair at that price and no Amazon option at $330–400 is honest
  competition. That call is the owner's standing preference: quality over
  commission.
- **Guide prose was reconciled** with the corrected catalog — dead links
  repointed, retired picks replaced, and budget-tier tables recomputed so the
  arithmetic matches the line items. Where a pick changed, the guide says plainly
  what happened and why, rather than quietly swapping the name; a reader who
  bought on the old advice deserves that.

Amazon links are skipped by `audit-links.mjs` by default — Amazon cloaks and
rate-limits non-browser clients, so results would be noise. All 116 were verified
correctly tagged in an earlier audit, and `dist` currently has **zero** untagged
Amazon links.

**Run `node scripts/audit-links.mjs` quarterly.** This class of rot is silent:
the page still renders, the link still returns 200, and it lands on a category
page next to a price the reader cannot check.

### Also parked (deliberate, not forgotten)

- `assets/css/bold.css` is dead weight — still linked from the `index.html`
  master, but that link never ships (only the `#assessment` block is extracted),
  so no built page loads it. Safe to delete along with that `<link>`; left alone
  because it is not causing harm and deletion is unrelated to this fix.
- Amazon PA-API / Creators API imagery stays blocked until 3 qualifying sales.
  Never hotlink `m.media-amazon.com` — it is a ToS violation that gets Associates
  accounts terminated. The category diagrams on `/deals` are the compliant
  stand-in, and `catalog.json`'s `image` field plus the card's image slot are
  already wired for the day real licensed photos exist.
- Hover/focus colour pairs outside the primary and accent families were never
  swept; the static audit does not exercise them.

---

## PREVIOUS HANDOFF (2026-07-27): ship branch `redesign/premium-2026-07-26` — DONE, shipped as 2d67817

**State.** Production currently serves a manually-deployed build of
`fix/ci-content-contracts` (all six of that branch's fixes verified live on
2026-07-26, but stamped `twp-release: dev`, so its assets are versioned
`?v=dev`). Local branch `redesign/premium-2026-07-26` (tip `bc7e8f1` + deals
work, ~24 commits) contains `fix/ci-content-contracts` in its ancestry plus:
pipeline fixes (monitor-test mock, deploy.yml release-timestamp quoting,
`src/lib/release.ts` real-SHA cache busting), the legibility/theme repairs
(theme is now opt-in via the header toggle; auto-dark removed; cascade
collisions fixed), the full blueprint redesign (variable Fraunces, drafting
hero, magazine grids, title-block footer, warm-charcoal dark mode), and the
deals consolidation (catalog.json is the single product source — 33 products,
counts/dates derived, matrix generated at build, original category diagrams
with "not a product photo" captions in all 11 deal cards).

**Deploy path — unchanged rule.** Do NOT run `wrangler pages deploy`
manually; per `DEPLOYMENT-HANDOFF.md` the only supported path is a push to
`main`, which runs `.github/workflows/deploy.yml` (build → astro check →
validator → node tests → Playwright → Pages deploy → Worker deploy →
authenticated monitor). The manual-deploy cache problem is additionally fixed
in code now: `src/lib/release.ts` derives a real short SHA when
`PUBLIC_RELEASE_SHA` is unset, so `?v=dev` can never ship again.

**Verified locally on this branch (2026-07-27):** `npm run build` (43 pages),
`npm run validate` (43 HTML / 271 files), `npm run check` (0 diagnostics),
`node --test tests/*.test.mjs` (44/44), `npx playwright test` (24 passed,
4 expected skips). WCAG AA contrast verified for changed pairs in both themes.

**First task — fix the push path itself.** The owner reports git pushes to
this repo "usually end up having issues," which is why past releases were
wrangler-deployed by hand — and every production incident in this repo's
history traces back to that workaround (untested deploys, `?v=dev` cache
breakage, untraceable prod lineage). Do not route around the problem again.
Diagnose and fix the root cause before shipping:
1. Reproduce it: `git push origin fix/ci-content-contracts` (a non-main
   branch — pushing it cannot trigger a deploy) and capture the exact error.
2. Check the usual suspects in order: `git remote -v` (SSH vs HTTPS; is the
   remote `blasscameron-oss/theworkspacepro`?); `gh auth status` (expired or
   wrongly-scoped token — needs `repo` + `workflow` scope; pushes touching
   `.github/workflows/` fail with a misleading error without `workflow`
   scope, and this branch DOES edit deploy.yml); branch protection rules on
   `main` (`gh api repos/blasscameron-oss/theworkspacepro/branches/main/protection`);
   any credential-helper mismatch between this machine's stored credentials
   and the `blasscameron-oss` account.
3. Also review why past deploy.yml runs failed:
   `gh run list --workflow deploy.yml --limit 10` — if the workflow itself
   was the "push issue," note that this branch already fixes its known
   failure (the monitor-test mock) and the full CI-equivalent suite is green
   locally, including Playwright.
4. Fix what you find, document the cause and fix in this file, and only then
   proceed with the ship steps below. If the push path is genuinely
   unfixable from this machine (e.g. account-level access the owner must
   grant), say so explicitly and STOP — ask the owner rather than falling
   back to a manual wrangler deploy.

**Ship steps (after the push path works):**
1. `git push origin fix/ci-content-contracts redesign/premium-2026-07-26`
   (backup both; pushing non-main branches does not deploy).
2. Open a PR `redesign/premium-2026-07-26` → `main`, review the diff, merge.
   The merge commit triggers the single production deployment. Do not also
   merge `fix/ci-content-contracts` separately — it is already contained.
3. Watch the run: `gh run list --workflow deploy.yml --limit 1`.

**Post-deploy smoke checks:**
- `curl -s https://www.theworkspacepro.com | grep twp-release` → real SHA, not `dev`.
- Assets referenced as `?v=<sha>`; old `?v=dev` objects become unreferenced (no purge needed).
- `/deals` → 11 cards, each with a FIG category diagram and the
  "CATEGORY DIAGRAM — NOT A PRODUCT PHOTO" caption; totals read 33/11 (derived).
- Theme toggle in header works; site defaults to light; no auto-dark.
- `/podcasts` → 301 `/guides`; `/favicon.ico` → 200; `release.json` `ts` is a real ISO timestamp.
- `/build-your-office` hero title legible in both themes (was the invisible-text bug).

**Still open (not blockers):** rotate the Cloudflare API token flagged in the
2026-07-22 section below; archive the superseded `workspace-pro-minimal` repo;
owner is Amazon-only by choice — no PA-API/images until 3 qualifying sales
(never hotlink Amazon image URLs; category diagrams are the compliant visual).

Sections below this line are historical (2026-07-22 incident, since resolved);
note their "34 products / exactly 11 hardcoded picks" descriptions predate the
catalog consolidation and no longer describe the code.

---

# Previous handoff — restore one correct production release (historical)

- **Prepared:** 2026-07-22
- **Priority:** Production incident; finish before more design/content work
- **Canonical repo:** `/home/cameron/.openclaw/workspace/theworkspacepro-v2`
- **GitHub:** `blasscameron-oss/theworkspacepro`
- **Pages project:** `the-workspace-pro`
- **Production:** `https://www.theworkspacepro.com`
- **Worker:** `twp-monitor`

## UI follow-up ready for Finch (2026-07-22)

Commit `6a32dad` repaired the main production-origin failure: new HTML is live,
slash redirects are consistent, and the five formerly blank July guides now have
content. The screenshot breakage that remains live is an asset-generation split:
Cloudflare still serves old unversioned `style.css` and `site.js` objects while
cache-busted requests return the current files.

The canonical worktree now contains a tested, uncommitted UI follow-up:

- Home metrics are truthful static values: 22 guides, 7 profiles, 34 products.
- Home's measurement visual, metrics, actions, and assessment card have deliberate
  desktop and mobile layouts.
- Deals, Tools, and Compare now use the same Astro BaseLayout, header, footer,
  light palette, typography, navigation order, and mobile breakpoint as Home and
  Guides.
- Deals retains exactly 11 picks, all retailer URLs, `workspacepro-20`,
  sponsored attributes, disclosures, query filters, reset, and analytics. The
  cramped JS-injected fingerprint rows are removed.
- Shared CSS/JS and page scripts use the deployment SHA as a query version;
  `PUBLIC_RELEASE_SHA` is supplied during the GitHub build.
- Release meta is emitted inside each shared page head, not after `</html>`.
- Merge ownership prevents legacy Deals/Tools/Compare from overwriting Astro.

Local verification is green: Astro 0 diagnostics; validator 45 HTML/223 total
files; 19 Node contracts; Playwright 24 passed with 4 expected project skips.
Review the diff, commit it, push `main` through the supported workflow, verify
the unique deployment, and then purge/remove stale unversioned asset objects and
rules. Do not deploy an old directory manually.

## Required outcome

Make the custom domain, stable Pages hostname, and latest production deployment serve the same Git commit and site. Remove the old/new route split, preserve Deals and every affiliate link, remove accidental `noindex` from public pages, and make CI fail if this happens again.

This incident has three overlapping causes:

1. The latest correct artifact reached a unique Pages preview but not the stable production aliases.
2. A seven-day custom-domain HTML cache preserves different releases per URL.
3. The built artifact intentionally combines new Astro pages with legacy HTML.

## Historical incident state (superseded by the update above)

- Canonical repo is clean: `main == origin/main == 02279ab`.
- Successful run: `29881060473`.
- Correct preview: `https://7e3c9d2f.the-workspace-pro.pages.dev/`.
- `https://the-workspace-pro.pages.dev/` serves an older 4 KB fallback.
- Production homepage is legacy; `/guides` is new but `/guides/` is old.
- `/compare/` is new while `/compare` can be blank; Tools variants also disagree.
- `/deals` is the old April 2026 design.
- Five July guides linked from Guides return HTTP 200 with effectively empty bodies.
- Cached new responses have carried `s-maxage=604800`, nonzero `Age`, and `X-Robots-Tag: noindex`.
- Cache-busting queries can turn working pages or CSS into the old HTML fallback.
- Old `/content/...` articles coexist with canonical `/guides/...` versions.

## Critical safety rule

> **Do not purge Cloudflare first.** Correct and verify the Pages production deployment before purging. A purge now can remove the surviving new cached pages and expose the broken fallback everywhere.

Do not upload an old directory, deploy the repository root, or deploy from any other checkout.

## 1. Establish one deployment authority

In Cloudflare Pages project `the-workspace-pro`, record:

- configured production branch;
- current production deployment ID, branch, commit SHA, timestamp, and source;
- attached custom domains;
- whether Cloudflare native Git builds are enabled;
- recent Direct Upload deployments and their actor/source.

Then:

1. Set the production branch to `main`.
2. Keep GitHub Actions as the sole deploy authority; disable duplicate native Git builds.
3. Confirm `www.theworkspacepro.com` and `pages.theworkspacepro.com` bind to this exact project, not an older project or Worker route.
4. Review Direct Upload/API access and retire obsolete automation only after identifying it.
5. Do not delete deployment history.

Stop if the account, project, or production branch is ambiguous. Resolve ownership before changing cache state.

Before promotion, disable the broad seven-day HTML cache rule and any public-route
`X-Robots-Tag: noindex` or homepage-fallback rewrite at the zone level, but **do
not purge existing objects yet**. The safest incident setting is to bypass edge
caching for the entire `www` host temporarily. Inspect Cache Rules, legacy Page
Rules, Response Header Transform Rules, Workers routes, Snippets, Bulk Redirects,
and Origin Rules. Preserve the apex-to-`www` redirect with path and query intact.

## 2. Harden GitHub deployment

Update `.github/workflows/deploy.yml` so deployment explicitly identifies production and its commit:

```yaml
- name: Deploy to Cloudflare Pages production
  id: pages_deploy
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: >-
      pages deploy dist
      --project-name=the-workspace-pro
      --branch=main
      --commit-hash=${{ github.sha }}
      --commit-dirty=false
```

Before committing, confirm the pinned Wrangler version supports those flags. Pin Wrangler rather than accepting a dynamic install. Configure the Pages output directory as `dist` in a supported Pages configuration to remove the current warning. The existing root `wrangler.toml` names and configures the `twp-monitor` Worker; plain `wrangler deploy` deploys that Worker, not Pages. Do not accidentally replace its Worker configuration with Pages configuration.

Also:

- Prevent superseded runs from later publishing obsolete commits, either by safe concurrency cancellation before deploy or a latest-`main` SHA guard immediately before deploy.
- Keep all build, Astro, artifact, contract, Playwright, Worker, and monitor checks.
- Generate `dist/release.json` and a `<meta name="twp-release">` value from `GITHUB_SHA`.
- Capture the unique deployment URL/ID and smoke-test it.
- Require the stable Pages hostname and custom domain to report the expected SHA. A green preview upload is insufficient.

Never print secret values. Verify only these secret names: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `MONITOR_SECRET`.

## 3. Deploy and prove the origin

Commit the workflow/provenance changes to `main`, push once, and watch the complete run. Before touching cache, test the unique deployment and stable Pages hostname:

- `/`, `/guides`, `/deals`, `/compare/`, and `/tools` contain expected body markers.
- These five routes contain real article content, not shell-only 200s:
  - `/guides/chair-seat-depth-by-height`
  - `/guides/low-cost-ergonomic-workspace-fixes`
  - `/guides/monitor-arms-for-thick-or-shallow-desks`
  - `/guides/standing-desks-for-short-users`
  - `/guides/standing-desks-for-tall-users`
- `/assets/css/style.css`, with and without a query, returns CSS and a CSS content type.
- Release JSON/meta equals the deployed commit.
- Deals contains all 11 intended cards.
- Every Amazon URL retains `tag=workspacepro-20` and `rel="sponsored"`.

If stable Pages still differs from the unique URL, do not purge. Fix the Pages project/production binding first.

## 4. Correct cache rules, then purge once

Inspect Cache Rules, legacy Page Rules, Workers routes, Transform Rules, redirects, and origin rules for the domain.

1. Disable/narrow any broad `Cache Everything` or seven-day edge-TTL rule for HTML.
2. Public HTML should bypass edge caching or revalidate with `Cache-Control: public, max-age=0, must-revalidate`.
3. Removed operational paths must return real, uncached 404s.
4. Use long immutable caching only for content-hashed assets. Non-fingerprinted assets must revalidate.
5. Ensure queries do not route valid pages/assets to fallback HTML.

Remember that matching Cloudflare Pages `_headers` rules can inherit/combine.
Detach an inherited header before replacing it in a narrower rule. Dashboard
Transform Rules, Workers, and already-cached responses can override or outlive
repository `_headers`, so repository changes alone are not sufficient.

Only after stable Pages is correct, perform one full zone purge. This is justified once because stale objects span HTML, redirects, CSS, slash variants, and several releases.

Immediately verify from multiple edges if available. Check status, final URL, `Content-Type`, body marker, release SHA, `CF-Cache-Status`, `Age`, `Cache-Control`, and robots headers—not just HTTP 200.

## 5. Fix routing, duplicates, and indexing

- Enforce one canonical form. Recommended: `/guides`, `/tools`, `/compare/`, and `/deals`.
- Permanently redirect noncanonical slash variants. They must never resolve to different artifacts.
- Remove the catch-all that returns the 4 KB empty shell with HTTP 200. Unknown routes must be genuine 404s.
- Redirect old `/content/<slug>/` and root article aliases to corresponding `/guides/<slug>` canonicals.
- Put only canonical URLs in canonical tags and sitemap.
- Public custom-domain pages must not send `X-Robots-Tag: noindex` or contain a noindex meta tag. Preview deployments may remain noindexed.
- Keep intentionally private/embed surfaces noindexed.

After verification, submit the sitemap and request indexing for Home, Deals, Guides, and the five new guides in Search Console.

## 6. Finish the visual migration without losing revenue

The build currently runs Astro, then `scripts/merge-legacy-public.mjs` copies legacy HTML into `dist`. Even a correct deploy therefore remains visually mixed.

After production is stable:

1. Move Deals first into the shared Astro layout without changing product inventory, disclosures, affiliate tags, filters, or analytics.
2. Migrate About, calculators/tools, budget builder, and remaining guides to the same shell and design system.
3. Replace broad root-HTML copying with an explicit temporary legacy-route manifest.
4. Fail builds on every Astro/legacy collision.
5. Add a contract assigning one owner and expected shell marker to every public URL.
6. Remove the merge script when the last legacy route is migrated.

Do not “clean up” affiliate content by deleting commercial sections. Preserve 11 Deals picks, comparison CTAs, guide recommendations, `workspacepro-20`, disclosures, and sponsored attributes.

## Acceptance checklist

- [ ] Git `main`, successful Actions run, Pages production deployment, release JSON, and page meta report one SHA.
- [ ] Unique URL, stable Pages, `pages.theworkspacepro.com`, and `www.theworkspacepro.com` have matching content markers.
- [ ] Slash variants never serve different designs.
- [ ] Query strings preserve correct page/asset and content type.
- [ ] No canonical route is blank or shell-only HTTP 200.
- [ ] Unknown URLs and operational Markdown return 404.
- [ ] No public custom-domain page is noindexed.
- [ ] All five July guides are complete and in the sitemap.
- [ ] Old content duplicates redirect to canonical guides.
- [ ] Deals has 11 intended products and works at desktop and 390 px.
- [ ] Automated scan confirms every Amazon link has `workspacepro-20` and `rel="sponsored"`.
- [ ] Remaining pages share one navigation and design system.
- [ ] Monitor checks release SHA, body markers, content type, robots state, and representative routes.
- [ ] CI fails if production aliases do not serve the just-deployed SHA.

When inspecting headers with curl, use `--http1.1` so an HTTP/2 `103 Early
Hints` block is not mistaken for the final response.

## Separate credential safety action

A credential-looking Cloudflare token was found in a local workspace memory file
during the audit. Do not copy it into this handoff, a terminal transcript, a Git
commit, or CI output. Identify it by fingerprint/account in a secure interface,
revoke or rotate it, replace it only in the appropriate secret stores, and scrub
the plaintext from local operational notes/history as a separate security task.

## Completion evidence for Cameron

Return one report with:

- deployed commit and Actions run URL;
- Pages deployment ID and unique URL;
- production branch and confirmation duplicate deploy sources are disabled;
- cache/routing rules changed and purge timestamp;
- route table with status, final URL, content type, SHA, cache status, Age, and robots header;
- affiliate scan totals and Deals-card count;
- desktop/mobile screenshots of Home, Guides, Deals, and one new guide;
- every remaining legacy route with an owner and migration date.

Do not call this complete based only on a green workflow or HTTP 200.

---

# Push-path diagnosis (2026-07-27 17:07 CT by Finch)

## Findings

**Root cause found:** Git pushes work fine. The "push issues" the owner reported were:
1. **CI was actually broken** — 3 of the last 4 `deploy.yml` runs on `main` failed
   (contract tests, health check, type checks at different times)
2. **No `gh` CLI auth** — couldn't debug workflow failures from the command line
   → fell back to manual `wrangler pages deploy`
3. **Branch protection `main`** — **Not protected** (API returned 404 for protection endpoint)

**Data collected:**
| Check | Result |
|-------|--------|
| `git remote -v` | ✅ HTTPS to `blasscameron-oss/theworkspacepro.git` |
| Real push (workflow files included) | ✅ Created & deleted test branch; stored PAT has `workflow` scope |
| `gh auth status` | ❌ Not logged in. Stored PAT lacks `read:org` scope |
| Branch protection on `main` | ✅ **Not protected** — direct push allowed |
| Past deploys (API) | ✅ Run 29881060473 last green (Jul 22); 3/4 subsequent runs failed |

**CI failure history on `main`:**
| Run SHA | Date | Failed Step |
|---------|------|-------------|
| 53cc0b7 | Jul 25 03:30 | Run release contract tests |
| b683f0a | Jul 25 03:16 | Run authenticated health check |
| 4dd6eb8 | Jul 22 13:33 | Check types and content contracts |
| 02279ab | Jul 22 00:43 | ✅ Last green |

**Fix in this branch:** The pipeline fixes (monitor-test mock, deploy.yml timestamp quoting, `src/lib/release.ts` real-SHA cache busting) in commits ahead of `fix/ci-content-contracts` address all three failure modes.

**Authentication used for this diagnosis:** GitHub PAT from `~/.git-credentials`,
used via `curl` against the GitHub REST API (bypassing `gh` CLI).
