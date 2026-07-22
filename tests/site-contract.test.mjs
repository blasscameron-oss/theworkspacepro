import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = process.cwd();
const dist = path.join(root, 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');

test('component routes and desk-fit cluster are emitted', () => {
  for (const file of [
    'index.html', 'guides.html', 'deals.html',
    'guides/chair-seat-depth-by-height.html',
    'guides/standing-desks-for-short-users.html',
    'guides/standing-desks-for-tall-users.html',
    'guides/monitor-arms-for-thick-or-shallow-desks.html',
    'guides/low-cost-ergonomic-workspace-fixes.html',
  ]) assert.ok(fs.existsSync(path.join(dist, file)), `${file} should exist`);
});

test('analytics is singular and assessment only ships on home', () => {
  const htmlFiles = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(dist);
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    assert.equal((html.match(/\/assets\/js\/analytics\.js/g) || []).length, 1, path.relative(dist, file));
    assert.equal((html.match(/\/assets\/js\/assessment\.js/g) || []).length, file === path.join(dist, 'index.html') ? 1 : 0);
  }
});

test('new guides expose research method, sources, date, and honest disclosures', () => {
  const html = read('guides/standing-desks-for-short-users.html');
  assert.match(html, /How this guide was prepared/);
  assert.match(html, /Updated July 21, 2026/);
  assert.match(html, /Research-led/);
  assert.doesNotMatch(html, /Some merchant links may be affiliate links/);
  assert.match(html, /Keep working on your setup/);
  assert.match(html, /id="sources-title"/);
});

test('shared height math retains golden values and rejects invalid heights', () => {
  const source = fs.readFileSync(path.join(root, 'assets/js/height-math.js'), 'utf8');
  const context = { globalThis: {} };
  vm.runInNewContext(source, context);
  const math = context.globalThis.TWPHeightMath;
  assert.equal(math.selfTest(), true);
  assert.deepEqual({ ...math.computeFromInches(69) }, {
    standingDesk: 38, sittingDesk: 27.9, chair: 17.3,
    monitorTop: 48.3, monitorDistance: 22.8, keyboard: 27.9,
  });
  assert.throws(() => math.computeFromInches(0), /positive number/);
});

test('catalog remains bounded and Amazon affiliate links stay tagged', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/catalog.json'), 'utf8'));
  assert.equal(catalog.affiliateTag, 'workspacepro-20');
  assert.ok(catalog.products.length <= 40);
  assert.equal(new Set(catalog.products.map((product) => product.id)).size, catalog.products.length,
    'catalog product IDs must be unique');
  for (const product of catalog.products) {
    assert.ok(product.id && product.name && product.category && product.url);
    assert.equal(product.evidenceLevel, 'research');
    assert.ok(Array.isArray(product.limitations) && product.limitations.length > 0);
    if (/amazon\.com/i.test(product.url)) {
      assert.equal(new URL(product.url).searchParams.get('tag'), 'workspacepro-20', product.id);
    }
  }
});

test('rendered deals keep useful inventory, disclosures, and attributed Amazon links', () => {
  const html = read('deals.html');
  const cards = html.match(/<article\b[^>]*class="[^"]*\bdeal-card\b[^"]*"[^>]*>/g) || [];
  assert.ok(cards.length > 0, 'deals.html should render at least one deal card');
  assert.match(html, /class="deals-disclosure"[^>]*>[\s\S]*?affiliate links[\s\S]*?commission/i);
  assert.match(html, /href="\/affiliate-disclosure"/);

  const amazonHrefs = [...html.matchAll(/href="(https:\/\/[^"\s]*amazon\.com[^"\s]*)"/gi)]
    .map((match) => match[1].replaceAll('&amp;', '&'));
  assert.ok(amazonHrefs.length > 0, 'deals.html should expose at least one Amazon offer');
  for (const href of amazonHrefs) {
    assert.equal(new URL(href).searchParams.get('tag'), 'workspacepro-20', href);
  }
});

test('rebuilt navigation and commercial discovery surfaces expose deals', () => {
  for (const file of ['index.html', 'guides.html', 'guides/standing-desks-for-short-users.html']) {
    const html = read(file);
    const primaryNav = html.match(/<nav\b[^>]*aria-label="Primary navigation"[^>]*>[\s\S]*?<\/nav>/i)?.[0];
    assert.ok(primaryNav, `${file} should include primary navigation`);
    assert.match(primaryNav, /href="\/deals"/, `${file} primary navigation should link to deals`);
  }

  const compare = read('compare/index.html');
  const main = compare.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
  assert.ok(main, 'compare page should include main content');
  assert.match(main, /href="\/deals"/, 'comparison shoppers should be able to discover deals');
});

test('homepage commerce and rebuilt guide paths preserve deals attribution and discovery', () => {
  const home = read('index.html');
  const commercial = home.match(/<section\b[^>]*class="[^"]*\bcommercial-section\b[^"]*"[^>]*>[\s\S]*?<\/section>/i)?.[0];
  assert.ok(commercial, 'home should render its commercial value-picks section');
  const cards = commercial.match(/<article\b[^>]*class="[^"]*\bcommercial-card\b[^"]*"[^>]*>/g) || [];
  assert.equal(cards.length, 4, 'home should render the four curated value picks');
  const amazonLinks = [...commercial.matchAll(/<a\b[^>]*href="(https:\/\/[^"\s]*amazon\.com[^"\s]*)"[^>]*>/gi)];
  assert.equal(amazonLinks.length, 4, 'each homepage value pick should link to Amazon');
  for (const [tag, href] of amazonLinks.map((match) => [match[0], match[1].replaceAll('&amp;', '&')])) {
    assert.equal(new URL(href).searchParams.get('tag'), 'workspacepro-20', href);
    assert.match(tag, /rel="[^"]*\bsponsored\b[^"]*"/i, href);
  }
  assert.match(commercial, /href="\/deals"/);

  for (const file of ['index.html', 'guides.html', 'guides/standing-desks-for-short-users.html']) {
    const html = read(file);
    const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0];
    assert.ok(footer, `${file} should include a footer`);
    assert.match(footer, /href="\/deals"/, `${file} footer should link to deals`);
  }

  const guideDeals = [
    ['guides/chair-seat-depth-by-height.html', '/deals?category=chair'],
    ['guides/standing-desks-for-short-users.html', '/deals?category=desk'],
    ['guides/standing-desks-for-tall-users.html', '/deals?category=desk'],
    ['guides/monitor-arms-for-thick-or-shallow-desks.html', '/deals?category=monitor'],
    ['guides/low-cost-ergonomic-workspace-fixes.html', '/deals?category=accessory'],
  ];
  for (const [file, href] of guideDeals) {
    const html = read(file);
    assert.ok(html.includes(`href="${href}"`), `${file} should link to ${href}`);
  }
});
