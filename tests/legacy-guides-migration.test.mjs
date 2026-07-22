import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const dist = path.join(root, 'dist');
const legacyIds = [
  'back-pain-ergonomic-setup', 'best-ergonomic-office-chairs-2026',
  'best-standing-desk-mat-for-concrete-floors', 'best-standing-desks-under-500',
  'cable-management-solutions', 'desk-chair-height-chart',
  'dual-monitor-home-office', 'dual-monitor-setup-productivity',
  'ergonomic-accessories-home-office', 'ergonomic-office-chair-buying-guide',
  'ergonomic-setup-for-gamers', 'home-office-budget-setup-under-1000',
  'home-office-desk-guide-2026', 'home-office-lighting-guide',
  'night-shift-lighting-guide', 'productive-workspace-mindset',
  'small-home-office-organization-hacks',
];

function readGuide(id) {
  const file = path.join(dist, 'guides', `${id}.html`);
  assert.ok(fs.existsSync(file), `Missing guide: guides/${id}.html`);
  return fs.readFileSync(file, 'utf8');
}

function countPattern(html, regex) {
  return [...html.matchAll(new RegExp(regex, 'gi'))].length;
}

test('all 17 legacy guide HTML files are emitted', () => {
  for (const id of legacyIds) {
    assert.ok(fs.existsSync(path.join(dist, 'guides', `${id}.html`)), `Missing ${id}.html`);
  }
});

test('every legacy guide has editorial header and footer', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    assert.ok(/<header\b/i.test(html), `${id}: missing header`);
    assert.ok(/<footer\b/i.test(html), `${id}: missing footer`);
  }
});

test('every legacy guide has exactly one h1 and one main', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    assert.equal(countPattern(html, /<h1\b/), 1, `${id}: expected 1 h1`);
    assert.equal(countPattern(html, /<main\b/), 1, `${id}: expected 1 main`);
  }
});

test('every legacy guide has correct canonical', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    const expected = `https://www.theworkspacepro.com/guides/${id}`;
    assert.ok(html.includes(expected), `${id}: canonical missing ${expected}`);
  }
});

test('every legacy guide has substantive article content (>2000 chars body)', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    const body = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.ok(body.length > 2000, `${id}: body too short (${body.length} chars)`);
  }
});

test('every legacy guide retains all Amazon and amzn.to links', () => {
  const totalAmazonLinks = legacyIds.reduce((sum, id) => sum + countPattern(readGuide(id), /https?:\/\/(?:www\.)?amazon\.com\b/g), 0);
  const totalAmznLinks = legacyIds.reduce((sum, id) => sum + countPattern(readGuide(id), /https?:\/\/amzn\.to\b/g), 0);
  assert.equal(totalAmazonLinks + totalAmznLinks, 280,
    `Expected 280 total Amazon/amzn.to links across all guides, got ${totalAmazonLinks + totalAmznLinks}`);
});

test('every Amazon link has tag=workspacepro-20', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    const links = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/)?(?:www\.)?(?:amazon\.com|amzn\.to)[^"']*["'][^>]*>/gi)];
    for (const link of links) {
      assert.ok(link[0].includes('tag=workspacepro-20'),
        `${id}: missing tag=workspacepro-20 in ${link[0].slice(0, 120)}`);
    }
  }
});

test('every Amazon link has target="_blank"', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    const links = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/)?(?:www\.)?(?:amazon\.com|amzn\.to)[^"']*["'][^>]*>/gi)];
    for (const link of links) {
      assert.ok(link[0].includes('target="_blank"'),
        `${id}: missing target="_blank" in ${link[0].slice(0, 120)}`);
    }
  }
});

test('every Amazon link has rel="sponsored noopener noreferrer"', () => {
  for (const id of legacyIds) {
    const html = readGuide(id);
    const links = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["'](?:https?:\/\/)?(?:www\.)?(?:amazon\.com|amzn\.to)[^"']*["'][^>]*>/gi)];
    for (const link of links) {
      assert.ok(/rel\s*=\s*["']sponsored\s+noopener\s+noreferrer["']/i.test(link[0]),
        `${id}: missing sponsored noopener noreferrer rel in ${link[0].slice(0, 120)}`);
    }
  }
});

test('no legacy guide shell or empty shell in dist root', () => {
  const htmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) htmlFiles.push(full);
    }
  }
  walk(dist);
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.length > 1000, `${file}: possible shell (${content.length} bytes)`);
  }
});

test('Markdown content guides also emit correctly', () => {
  const mdIds = [
    'chair-seat-depth-by-height', 'low-cost-ergonomic-workspace-fixes',
    'monitor-arms-for-thick-or-shallow-desks', 'standing-desks-for-short-users',
    'standing-desks-for-tall-users',
  ];
  for (const id of mdIds) {
    const html = readGuide(id);
    assert.ok(html.includes('twp-release'), `${id}: missing twp-release`);
    assert.ok(html.includes('editorial-shell'), `${id}: missing editorial-shell class`);
    assert.ok(/<h1\b/i.test(html), `${id}: missing h1`);
  }
});

test('no .orig or .rej artifacts in dist', () => {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.orig') || entry.name.endsWith('.rej')) {
        assert.fail(`Found patch artifact in dist: ${full}`);
      }
    }
  }
  walk(dist);
});

test('no operational Markdown files in dist', () => {
  const mdFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) mdFiles.push(full);
    }
  }
  walk(dist);
  // release.json is not .md, and we should have zero .md in dist
  assert.equal(mdFiles.length, 0, `Found ${mdFiles.length} .md files in dist`);
});
