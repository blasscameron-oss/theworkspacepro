import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const dist = path.join(process.cwd(), 'dist');
const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');

test('primary discovery routes share one editorial shell and navigation order', () => {
  for (const file of ['index.html', 'guides.html', 'deals.html', 'compare/index.html', 'tools.html']) {
    const html = read(file);
    assert.match(html, /<body[^>]*class="[^"]*\beditorial-shell\b/, file);
    assert.equal((html.match(/class="editorial-header"/g) || []).length, 1, file);
    assert.equal((html.match(/class="editorial-footer"/g) || []).length, 1, file);
    assert.doesNotMatch(html, /class="(?:site-header|mobile-nav|theme-toggle)"/, file);
    const nav = html.match(/<nav[^>]*aria-label="Primary navigation"[^>]*>[\s\S]*?<\/nav>/i)?.[0] || '';
    const positions = ['Guides', 'Compare', 'Tools', 'Deals'].map((label) => nav.indexOf(`>${label}</a>`));
    assert.ok(positions.every((position) => position >= 0), `${file} has every primary link`);
    assert.deepEqual([...positions].sort((a, b) => a - b), positions, `${file} keeps navigation order`);
  }
});

test('shared pages publish release metadata and deployment-versioned assets', () => {
  for (const file of ['index.html', 'guides.html', 'deals.html', 'compare/index.html', 'tools.html']) {
    const html = read(file);
    const release = html.match(/<meta name="twp-release" content="([^"]+)">/)?.[1];
    assert.ok(release, `${file} publishes a release marker`);
    const escapedRelease = release.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');
    assert.match(html, new RegExp(`/assets/css/style\\.css\\?v=${escapedRelease}`), file);
    assert.match(html, new RegExp(`/assets/css/editorial-v4\\.css\\?v=${escapedRelease}`), file);
    assert.match(html, new RegExp(`/assets/js/site\\.js\\?v=${escapedRelease}`), file);
  }
});

test('homepage metrics are truthful static content rather than broken zero placeholders', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /data-counter/);
  assert.match(html, /class="stat__number">22<\/div>[\s\S]*?Practical Guides/);
  assert.match(html, /class="stat__number">7<\/div>[\s\S]*?Workspace Personas/);
  assert.match(html, /class="stat__number">34<\/div>[\s\S]*?Products Researched/);
});
