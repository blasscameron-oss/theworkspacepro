import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'dist/deals.html'), 'utf8');

test('Astro owns Deals and renders the complete editorial shortlist', () => {
  assert.match(html, /<body[^>]*class="[^"]*editorial-shell/);
  assert.match(html, /<nav[^>]*aria-label="Primary navigation"/);
  assert.match(html, /<footer[^>]*class="editorial-footer"/);
  assert.equal((html.match(/<article[^>]*class="deal-card"/g) || []).length, 11);
  assert.doesNotMatch(html, /\/assets\/js\/deals\.js/);
  assert.doesNotMatch(html, /deal-card__fingerprint|deal-card__instrument/);
});

test('Deals preserves retailer attribution and analytics metadata', () => {
  const links = [...html.matchAll(/<a\b[^>]*class="deal-card__cta"[^>]*>/g)].map((match) => match[0]);
  assert.equal(links.length, 11);
  for (const link of links) {
    assert.match(link, /rel="[^"]*\bsponsored\b[^"]*"/);
    assert.match(link, /data-deal-id="[^"]+"/);
    assert.match(link, /data-deal-category="[^"]+"/);
    assert.match(link, /data-retailer="[^"]+"/);
    assert.match(link, /data-reference-price="\d+"/);
  }
  for (const match of html.matchAll(/href="(https:\/\/[^"\s]*amazon\.com[^"\s]*)"/gi)) {
    const href = match[1].replaceAll('&amp;', '&');
    assert.equal(new URL(href).searchParams.get('tag'), 'workspacepro-20');
  }
  assert.match(html, /deal_filter/);
  assert.match(html, /deal_click/);
  assert.match(html, /URLSearchParams/);
});
