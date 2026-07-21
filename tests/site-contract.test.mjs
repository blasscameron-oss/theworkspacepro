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
    'index.html', 'guides.html',
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
  for (const product of catalog.products) {
    assert.ok(product.id && product.name && product.category && product.url);
    assert.equal(product.evidenceLevel, 'research');
    assert.ok(Array.isArray(product.limitations) && product.limitations.length > 0);
    if (/amazon\.com/i.test(product.url)) {
      assert.equal(new URL(product.url).searchParams.get('tag'), 'workspacepro-20', product.id);
    }
  }
});
