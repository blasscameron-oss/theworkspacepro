import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';

/**
 * The manifest is the contract the render layer trusts, so it may never
 * describe art that does not exist. Commit 7b3d2ff flipped seven masters to
 * `approved-production` in the same change that generated their variant files
 * as 50-byte stubs, and nothing caught it because nothing compared the claim
 * against the bytes on disk.
 */
const manifest = JSON.parse(readFileSync('assets/data/visual-manifest.json', 'utf8'));
const VARIANTS = ['desktop', 'mobile'];
const FORMATS = ['webp', 'avif'];
const MIN_REAL_BYTES = 2000;

const variantPath = (slug, variant, format) => `assets/images/editorial/${slug}-${variant}.${format}`;

test('every master declares the fields the renderer needs', () => {
  assert.ok(manifest.masters.length > 0, 'manifest must list masters');
  for (const master of manifest.masters) {
    assert.ok(master.slug, 'master needs a slug');
    assert.ok(master.altText?.trim(), `${master.slug} needs alt text`);
    assert.ok(Array.isArray(master.routes) && master.routes.length > 0, `${master.slug} needs routes`);
    assert.ok(master.focalPoint?.desktop, `${master.slug} needs a desktop focal point`);
    assert.match(master.approval, /^(approved-production|placeholder-pending-art)$/, `${master.slug} approval`);
  }
});

test('renderable masters carry dimensions that match the bytes on disk', () => {
  for (const master of manifest.masters.filter((m) => m.approval === 'approved-production')) {
    for (const variant of VARIANTS) {
      const declared = master.variantDimensions?.[variant];
      const contract = manifest.variantContract?.[variant];
      assert.ok(declared?.width > 0, `${master.slug} ${variant} needs dimensions — width/height prevent layout shift`);
      assert.equal(declared.width, contract.width, `${master.slug} ${variant} width must match the variant contract`);
      assert.equal(declared.height, contract.height, `${master.slug} ${variant} height must match the variant contract`);
    }
  }
});

test('approved-production masters have real artwork for every variant', () => {
  const liars = [];
  for (const master of manifest.masters.filter((m) => m.approval === 'approved-production')) {
    for (const variant of VARIANTS) {
      for (const format of FORMATS) {
        const file = variantPath(master.slug, variant, format);
        if (!existsSync(file)) liars.push(`${file} — missing`);
        else if (statSync(file).size < MIN_REAL_BYTES) liars.push(`${file} — ${statSync(file).size} byte stub`);
      }
    }
  }
  assert.deepEqual(liars, [], `masters claim production art they do not have:\n${liars.join('\n')}`);
});

test('placeholder masters are genuinely placeholders, not mislabelled real art', () => {
  for (const master of manifest.masters.filter((m) => m.approval === 'placeholder-pending-art')) {
    const file = variantPath(master.slug, 'desktop', 'webp');
    assert.ok(existsSync(file), `${file} should exist even as a stub`);
    assert.ok(
      statSync(file).size < MIN_REAL_BYTES,
      `${master.slug} has real artwork — promote it to approved-production instead of leaving it unrendered`,
    );
  }
});

test('no two masters claim the same route', () => {
  const seen = new Map();
  for (const master of manifest.masters) {
    for (const route of master.routes) {
      assert.equal(seen.get(route), undefined, `${route} claimed by both ${seen.get(route)} and ${master.slug}`);
      seen.set(route, master.slug);
    }
  }
});
