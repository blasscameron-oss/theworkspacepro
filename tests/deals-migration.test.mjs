import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'dist/deals.html'), 'utf8');

// The deals page is rendered from the catalog, so the test derives its
// expectations from that single source rather than hardcoding counts/prices.
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/catalog.json'), 'utf8'));
const shortlist = catalog.products.filter((product) => product.dealsShortlist === true);
const byId = new Map(catalog.products.map((product) => [product.id, product]));

const decode = (value) => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");

function parseCards() {
  return [...html.matchAll(/<article[^>]*class="deal-card"[^>]*>([\s\S]*?)<\/article>/g)].map((match) => {
    const block = match[0];
    const cta = block.match(/<a\b[^>]*class="deal-card__cta"[^>]*>/);
    const attr = (name) => {
      const found = cta && cta[0].match(new RegExp(`${name}="([^"]*)"`));
      return found ? decode(found[1]) : null;
    };
    return {
      id: attr('data-deal-id'),
      href: attr('href'),
      retailer: attr('data-retailer'),
      referencePrice: attr('data-reference-price'),
      rel: attr('rel'),
      category: attr('data-deal-category'),
    };
  });
}

test('Astro owns Deals and renders the shell without legacy hooks', () => {
  assert.match(html, /<body[^>]*class="[^"]*editorial-shell/);
  assert.match(html, /<nav[^>]*aria-label="Primary navigation"/);
  assert.match(html, /<footer[^>]*class="editorial-footer"/);
  assert.doesNotMatch(html, /\/assets\/js\/deals\.js/);
  assert.doesNotMatch(html, /deal-card__fingerprint|deal-card__instrument/);
});

test('card count equals the catalog dealsShortlist length', () => {
  const cards = parseCards();
  assert.ok(shortlist.length > 0, 'catalog should flag at least one dealsShortlist product');
  assert.equal(cards.length, shortlist.length);
  const cardIds = new Set(cards.map((card) => card.id));
  assert.equal(cardIds.size, cards.length, 'each rendered card should have a unique deal id');
  assert.deepEqual(cardIds, new Set(shortlist.map((product) => product.id)),
    'rendered cards must be exactly the flagged catalog products');
});

test('every card price, URL and retailer matches its catalog entry', () => {
  for (const card of parseCards()) {
    const product = byId.get(card.id);
    assert.ok(product, `card references unknown catalog id ${card.id}`);
    assert.equal(product.dealsShortlist, true, `${card.id} is rendered but not flagged in the catalog`);
    assert.equal(card.href, product.url, `href mismatch for ${card.id}`);
    assert.equal(Number(card.referencePrice), product.price, `reference price mismatch for ${card.id}`);
    assert.equal(card.retailer, product.retailer, `retailer mismatch for ${card.id}`);
    if (product.asin) {
      assert.ok(card.href.includes(`/dp/${product.asin}`), `Amazon URL for ${card.id} must contain its ASIN`);
    }
  }
});

test('every deal link carries sponsored rel and the analytics contract', () => {
  const cards = parseCards();
  assert.equal(cards.length, shortlist.length);
  for (const card of cards) {
    assert.ok(card.rel, `missing rel on ${card.id}`);
    for (const token of ['sponsored', 'noopener', 'noreferrer']) {
      assert.ok(card.rel.split(/\s+/).includes(token), `rel for ${card.id} must include ${token}`);
    }
    // Catalog prices are the retailer's live price, so cents are expected
    // (189.87, 19.48). The contract is "a plain number", not "a whole dollar".
    assert.match(card.referencePrice, /^\d+(?:\.\d+)?$/, `reference price must be numeric for ${card.id}`);
    assert.ok(card.category, `missing data-deal-category for ${card.id}`);
  }
  for (const match of html.matchAll(/href="(https:\/\/[^"\s]*amazon\.com[^"\s]*)"/gi)) {
    const href = decode(match[1]);
    assert.equal(new URL(href).searchParams.get('tag'), 'workspacepro-20');
  }
  assert.match(html, /deal_filter/);
  assert.match(html, /deal_click/);
  assert.match(html, /URLSearchParams/);
});

test('deals keeps its affiliate disclosure link and derived catalog date', () => {
  assert.match(html, /href="\/affiliate-disclosure"/);
  const reviewed = new Date(`${catalog.updated}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
  assert.ok(html.includes(reviewed), `disclosure must show the catalog.updated date (${reviewed})`);
  assert.ok(html.includes(`${catalog.products.length}-product catalog reviewed`),
    'principles list must show the derived catalog size');
});
