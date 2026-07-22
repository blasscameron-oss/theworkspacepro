import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.join(process.cwd(), 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');

const comparisons = [
  ['compare/branch-vs-uplift.html', 'Branch vs Uplift V2', 5],
  ['compare/herman-miller-vs-steelcase.html', 'Herman Miller vs Steelcase', 3],
  ['compare/shw-vs-flexispot.html', 'SHW vs FlexiSpot', 3],
];

for (const [file, heading, affiliateCount] of comparisons) {
  test(`${file} is an Astro-owned long-form article`, () => {
    const html = read(file);
    assert.match(html, /<body[^>]*class="[^"]*editorial-shell/);
    assert.equal((html.match(/class="editorial-header"/g) || []).length, 1);
    assert.equal((html.match(/class="editorial-footer"/g) || []).length, 1);
    assert.match(html, new RegExp(`<h1[^>]*>${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.match(html, /<nav class="toc"|<div class="toc"/);
    assert.match(html, /comparison-table/);
    assert.match(html, /Final Verdict/i);
    assert.match(html, /Affiliate disclosure/i);
    assert.match(html, /"@type":"Article"/);
    const links = html.match(/href="[^"]*(?:amazon\.com|amzn\.to)[^"]*tag=workspacepro-20[^"]*"/g) || [];
    assert.equal(links.length, affiliateCount);
    for (const link of html.match(/<a[^>]+href="[^"]*(?:amazon\.com|amzn\.to)[^"]*"[^>]*>/g) || []) {
      assert.match(link, /rel="[^"]*sponsored[^"]*"/);
    }
    assert.doesNotMatch(html, /class="(?:site-header|mobile-nav|theme-toggle)"/);
  });
}

test('height embed stays iframe-safe, noindex, and behaviorally complete', () => {
  const html = read('embed/height.html');
  assert.match(html, /<meta name="robots" content="noindex,nofollow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.theworkspacepro\.com\/ergonomic-height-calculator">/);
  assert.doesNotMatch(html, /editorial-header|editorial-footer|site-header|site-footer/);
  assert.match(html, /id="h"[^>]+min="54"[^>]+max="78"[^>]+value="69"/);
  assert.match(html, /TWPHeightMath\.computeFromInches/);
  assert.match(html, /utm_source=embed(?:&|&amp;)utm_medium=iframe(?:&|&amp;)utm_campaign=height_calc/);
  assert.match(html, /\/assets\/js\/height-math\.js\?v=/);
  assert.match(html, /\/assets\/js\/analytics\.js\?v=/);
});

test('embed response headers explicitly allow framing', () => {
  const headers = read('_headers');
  const block = headers.match(/\/embed\/\*[\s\S]*?(?=\n\/|$)/)?.[0] || '';
  assert.match(block, /! X-Frame-Options/);
  assert.match(block, /frame-ancestors \*/);
  assert.doesNotMatch(block, /X-Frame-Options:\s*DENY/);
});
