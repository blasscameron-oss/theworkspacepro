# Monthly ASIN health runbook

1. `python3 scripts/check_asins_site.py --fail-on-denylist`
2. Spot-check top commercial guides with `agent-browser` (or CF Worker soft sample if enabled).
3. Replace dead ASINs with browser-verified live products; keep `tag=workspacepro-20`.
4. Append bad ASINs to `scripts/asin_denylist.json`.
5. Update `FINCH_HANDOFF.md` smoke notes if product DBs change.
6. **Product images:** after Creators API is live, run `scripts/sync_amazon_catalog.*` (see **FINCH_HANDOFF.md → Amazon product images — API build plan**). Do **not** add stock photos or new scrapes as the long-term source.
7. Legacy: `scripts/fetch_product_image.py` is scrape-based scaffolding only — retire once API sync works.

**Never** reintroduce denylisted ASINs.
