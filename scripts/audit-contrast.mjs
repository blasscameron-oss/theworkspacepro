/**
 * WCAG AA text-contrast audit.
 *
 * Renders every important route at 375px in both themes, walks every visible
 * leaf text node, resolves the nearest solid background, and reports anything
 * below the AA threshold (4.5:1, or 3:1 for large text).
 *
 * Standalone:   node scripts/audit-contrast.mjs [baseUrl]
 *               (defaults to http://localhost:4331 — a `serve dist` / static
 *                server pointed at ./dist)
 *               Exits 1 if the LIGHT theme has any failure.
 *
 * As a library:  tests/e2e/contrast.spec.mjs imports PAGES + collectFailures
 *                so the same rules run as a permanent regression guard.
 */

export const PAGES = [
  '/',
  '/guides.html',
  '/deals.html',
  '/tools.html',
  '/tips.html',
  '/about.html',
  '/contact.html',
  '/compare/',
  '/build-your-office.html',
  '/ergonomic-height-calculator.html',
  '/workspace-setup-calculator.html',
  '/desk-fit-worksheet.html',
  '/guides/back-pain-ergonomic-setup.html',
  '/compare/branch-vs-uplift.html',
];

/**
 * Runs in the page. Returns every text node below its AA threshold, worst first.
 */
export const auditDocument = () => {
  const lum = (c) => {
    const m = c.match(/[\d.]+/g).map(Number);
    const [r, g, b] = m.slice(0, 3).map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const solid = (c) => c && !/rgba?\([^)]*,\s*0\)|transparent/.test(c);
  const bgOf = (el) => {
    let e = el;
    while (e) {
      const b = getComputedStyle(e).backgroundColor;
      if (solid(b)) {
        const a = b.match(/[\d.]+/g);
        if (!a[3] || Number(a[3]) > 0.85) return b;
      }
      e = e.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
  };
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (el.children.length) return;
    const txt = el.textContent.trim();
    if (!txt) return;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) < 0.1) return;
    if (el.closest('[aria-hidden="true"]')) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const fg = s.color;
    const bg = bgOf(el);
    const l1 = lum(fg);
    const l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight) >= 700;
    const min = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (ratio < min) {
      out.push({
        txt: txt.slice(0, 40),
        cls: el.className.toString().slice(0, 40),
        fg,
        bg,
        ratio: +ratio.toFixed(2),
        min,
        size,
        y: Math.round(r.top + scrollY),
      });
    }
  });
  return out.sort((a, b) => a.ratio - b.ratio);
};

/**
 * Decorative glyphs and the wordmark: shaped marks, not readable copy.
 */
const isIgnored = (f) =>
  /wordmark|theme-toggle__icon/.test(f.cls) || f.txt === 'Menu' || f.txt === 'The Workspace Pro';

export const formatFailure = (f) =>
  `${f.ratio}/${f.min} y=${f.y} [${f.cls}] "${f.txt}" fg=${f.fg} bg=${f.bg}`;

/**
 * Loads every page in PAGES under `theme` and returns `{ path, failures }`
 * entries for the pages that have at least one real failure.
 *
 * @param {import('playwright').BrowserContext} context - must already have the
 *   theme seeded into localStorage via addInitScript.
 * @param {string} baseUrl
 */
export async function collectFailures(context, baseUrl, pages = PAGES) {
  const page = await context.newPage();
  const results = [];
  for (const path of pages) {
    await page.goto(baseUrl + path, { waitUntil: 'networkidle' });
    const failures = (await page.evaluate(auditDocument)).filter((f) => !isIgnored(f));
    if (failures.length) results.push({ path, failures });
  }
  await page.close();
  return results;
}

export const seedTheme = (theme) => (ctx) =>
  ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);

/* ------------------------------------------------------------------ CLI --- */

const isCli = import.meta.url === `file://${process.argv[1]}`;
if (isCli) {
  const { chromium } = await import('playwright');
  const baseUrl = process.argv[2] || 'http://localhost:4331';
  const browser = await chromium.launch();
  let lightFailures = 0;
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await seedTheme(theme)(context);
    for (const { path, failures } of await collectFailures(context, baseUrl)) {
      if (theme === 'light') lightFailures += failures.length;
      console.log(`\n=== ${theme.toUpperCase()} ${path}`);
      failures.forEach((f) => console.log(`  ${formatFailure(f)}`));
    }
    await context.close();
  }
  await browser.close();
  if (lightFailures) {
    console.log(`\n${lightFailures} LIGHT-theme AA failure(s).`);
    process.exit(1);
  }
}
