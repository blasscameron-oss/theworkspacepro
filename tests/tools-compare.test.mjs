import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.join(process.cwd(), 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');

for (const [route, active] of [['tools.html', 'Tools'], ['compare/index.html', 'Compare']]) {
  test(`${route} uses the shared editorial shell`, () => {
    const html = read(route);
    assert.match(html, /<body[^>]*class="[^"]*editorial-shell/);
    assert.equal((html.match(/class="editorial-header"/g) || []).length, 1, 'one shared header');
    assert.equal((html.match(/<footer\b/g) || []).length, 1, 'one shared footer');
    assert.match(html, new RegExp(`<a[^>]*aria-current="page"[^>]*>${active}</a>|<a[^>]*>${active}</a>`));
    assert.doesNotMatch(html, /class="(?:site-header|mobile-nav|theme-toggle)"/);
  });
}

test('tools page presents every working tool and current inventory truth', () => {
  const html = read('tools.html');
  for (const href of [
    '/#assessment', '/build-your-office', '/ergonomic-height-calculator',
    '/workspace-setup-calculator', '/compare/',
  ]) assert.ok(html.includes(`href="${href}"`), href);
  assert.match(html, /six short steps and nine answers/i);
  assert.match(html, /all 22 built guides/i);
  assert.doesNotMatch(html, /All 17 guides/i);
});

test('comparison page keeps its filter contract and one matrix script', () => {
  const html = read('compare/index.html');
  for (const id of ['filterSearch', 'filterCategory', 'filterBudget', 'filterClear', 'matrixCount', 'matrixGrid']) {
    assert.match(html, new RegExp(`id="${id}"`), id);
  }
  assert.equal((html.match(/\/assets\/js\/compare-matrix\.js\?v=/g) || []).length, 1);
  assert.match(html, /36 catalog entries/i);
  assert.match(html, /href="\/deals"/);
});
