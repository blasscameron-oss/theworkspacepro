/**
 * Non-contrast accessibility + mobile sweep: pointer-target size (WCAG 2.5.8),
 * heading order, accessible names, form labelling, horizontal overflow, alt text.
 *
 *   node scripts/audit-a11y.mjs [baseUrl]   (defaults to http://localhost:4331)
 *
 * Companion to scripts/audit-contrast.mjs, and it derives its route list from
 * ./dist for the same reason: the guards that missed real bugs here were the
 * ones pinned to a hand-written page list. Links inside running prose are
 * exempt from the target-size rule, per WCAG.
 *
 * Advisory, not wired into CI — AAA target sizing is aspirational and the
 * remaining AA findings are inline prose links. Run it before a release.
 */
import { chromium } from '@playwright/test';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:4331';
const DIST = process.env.TWP_DIST || 'dist';

const walk = async (dir) => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
};

const routes = (await walk(DIST))
  .map((f) => f.replace(DIST, '').replace(/\/index\.html$/, '/'))
  .sort();

const audit = () => {
  const problems = [];
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  };
  const desc = (el) => {
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 45);
    return `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}${t ? ` "${t}"` : ''}`;
  };

  // 1. Tap targets < 44x44 (WCAG 2.5.8 AAA / 24x24 AA minimum)
  for (const el of document.querySelectorAll('a, button, input[type=checkbox], input[type=radio], select, [role=button]')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    // skip inline links inside running prose — those are exempt
    const inProse = el.closest('p, li, .guide-prose p, td');
    if (el.tagName === 'A' && inProse) continue;
    if (r.width < 24 || r.height < 24) {
      problems.push({ type: 'tap-target-AA', detail: `${Math.round(r.width)}x${Math.round(r.height)} ${desc(el)}` });
    } else if (r.width < 44 || r.height < 44) {
      problems.push({ type: 'tap-target-AAA', detail: `${Math.round(r.width)}x${Math.round(r.height)} ${desc(el)}` });
    }
  }

  // 2. Heading order jumps
  let prev = 0;
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis);
  for (const h of hs) {
    const lvl = Number(h.tagName[1]);
    if (prev && lvl > prev + 1) problems.push({ type: 'heading-jump', detail: `h${prev} -> h${lvl}: ${desc(h)}` });
    prev = lvl;
  }
  const h1s = hs.filter((h) => h.tagName === 'H1');
  if (h1s.length === 0) problems.push({ type: 'no-h1', detail: 'page has no visible h1' });
  if (h1s.length > 1) problems.push({ type: 'multiple-h1', detail: `${h1s.length} h1s` });

  // 3. Form controls without an accessible name
  for (const el of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
    if (!vis(el)) continue;
    const id = el.id;
    const named =
      (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
      el.closest('label') ||
      el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      el.getAttribute('title');
    if (!named) problems.push({ type: 'unlabeled-control', detail: desc(el) + (id ? ` #${id}` : ' (no id)') });
  }

  // 4. Buttons / links with no accessible name
  for (const el of document.querySelectorAll('a, button')) {
    if (!vis(el)) continue;
    const name = (el.textContent || '').trim() || el.getAttribute('aria-label') || el.getAttribute('title');
    if (!name) problems.push({ type: 'nameless-control', detail: desc(el) });
  }

  // 5. Horizontal overflow
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    problems.push({ type: 'h-overflow', detail: `scrollWidth ${de.scrollWidth} > viewport ${de.clientWidth}` });
    for (const el of document.querySelectorAll('body *')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 1 && r.width > 40) {
        problems.push({ type: 'h-overflow-node', detail: `right=${Math.round(r.right)} ${desc(el)}` });
        break;
      }
    }
  }

  // 6. Images without alt
  for (const el of document.querySelectorAll('img')) {
    if (!el.hasAttribute('alt')) problems.push({ type: 'img-no-alt', detail: el.getAttribute('src') || '?' });
  }

  // 7. Focus visibility on the first few interactive elements
  return problems;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
const byType = {};
let total = 0;

for (const route of routes) {
  const url = BASE + route;
  const resp = await page.goto(url, { waitUntil: 'networkidle' }).catch(() => null);
  if (!resp || !resp.ok()) { console.log(`!! ${route} -> ${resp ? resp.status() : 'ERR'}`); continue; }
  const problems = await page.evaluate(audit);
  for (const p of problems) {
    byType[p.type] ??= [];
    byType[p.type].push(`${route}  ${p.detail}`);
    total++;
  }
}

console.log(`\n=== A11Y/MOBILE SWEEP: ${routes.length} routes @375px, ${total} findings ===\n`);
for (const [type, list] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`--- ${type}: ${list.length}`);
  const uniq = [...new Set(list.map((l) => l.split('  ').slice(1).join('  ')))];
  for (const l of uniq) console.log(`    ${l}`);
  console.log(`    (${list.length} occurrences, ${uniq.length} distinct)`);
}
await browser.close();
