import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const dist = path.join(root, 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
const rootRoutes = [
  'about',
  'affiliate-disclosure',
  'build-your-office',
  'contact',
  'ergonomic-height-calculator',
  'home-office-setup-guide',
  'privacy',
  'terms',
  'tips',
  'workspace-setup-calculator',
];

test('all retained root routes are emitted by the shared Astro shell', () => {
  for (const route of rootRoutes) {
    const html = read(`${route}.html`);
    assert.match(html, /<body[^>]*class="[^"]*\beditorial-shell\b/, route);
    assert.equal((html.match(/class="editorial-header"/g) || []).length, 1, route);
    assert.equal((html.match(/class="editorial-footer"/g) || []).length, 1, route);
    assert.equal((html.match(/<main\b/g) || []).length, 1, route);
    assert.equal((html.match(/\/assets\/js\/analytics\.js/g) || []).length, 1, route);
    assert.doesNotMatch(html, /class="(?:site-header|mobile-nav|theme-toggle)"/, route);
    assert.match(html, new RegExp(`rel="canonical" href="https://www\\.theworkspacepro\\.com/${route}"`), route);
  }
});

test('interactive root tools preserve their inputs and page-specific execution', () => {
  const builder = read('build-your-office.html');
  assert.match(builder, /id="budgetSlider"/);
  assert.equal((builder.match(/\/assets\/js\/build-your-office\.js\?v=/g) || []).length, 1);

  const height = read('ergonomic-height-calculator.html');
  assert.match(height, /id="heightSlider"/);
  assert.match(height, /window\.ehcSetUnit/);
  assert.equal((height.match(/\/assets\/js\/height-math\.js\?v=/g) || []).length, 1);

  const setup = read('workspace-setup-calculator.html');
  assert.match(setup, /id="wscBudgetSlider"/);
  assert.match(setup, /window\.wscGenerate/);
  for (const match of setup.matchAll(/href="(https:\/\/[^"\s]*amazon\.com[^"\s]*)"/gi)) {
    assert.equal(new URL(match[1].replaceAll('&amp;', '&')).searchParams.get('tag'), 'workspacepro-20');
  }
});

test('forms, legal copy, visual masters, and 404 behavior survive migration', () => {
  assert.match(read('contact.html'), /action="https:\/\/formspree\.io\/f\/xpwagjrk"/);
  assert.match(read('affiliate-disclosure.html'), /Federal Trade Commission/);
  assert.match(read('about.html'), /data-visual-master="studio-method-notebook-v1"/);
  assert.match(read('about.html'), /"@type":"AboutPage"/);
  assert.match(read('contact.html'), /"@type":"ContactPage"/);
  assert.match(read('build-your-office.html'), /"@type":"WebApplication"/);
  const notFound = read('404.html');
  assert.match(notFound, /name="robots" content="noindex, follow"/);
  assert.match(notFound, /This page is off the drafting table/);
  assert.doesNotMatch(read('sitemap.xml'), /\/404<\/loc>/);
});

test('the deployment finalizer cannot copy source HTML', () => {
  const source = fs.readFileSync(path.join(root, 'scripts/finalize-public-site.mjs'), 'utf8');
  assert.doesNotMatch(source, /copyTree\([^\n]*source[^\n]*\.html/);
  assert.doesNotMatch(source, /readdirSync\(root\)[\s\S]*endsWith\(['"]\.html/);
  assert.match(source, /for \(const directory of \['css', 'data', 'fonts', 'js'\]\)/);
  assert.match(source, /\(source\) => \/\\\.\(\?:avif\|webp\)\$\/i\.test\(source\)/);
  for (const file of fs.readdirSync(path.join(dist, 'assets/images/editorial'))) {
    assert.doesNotMatch(file, /-master\.png$/i);
  }

  const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
  assert.match(redirects, /^\/changelog\s+\/about\s+301$/m);
  assert.match(redirects, /^\/podcasts\s+\/guides\s+301$/m);
  assert.ok(!fs.existsSync(path.join(dist, 'changelog.html')));
  assert.ok(!fs.existsSync(path.join(dist, 'podcasts.html')));
});
