# Finch handoff — restore one correct production release

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
