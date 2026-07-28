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
 *               Exits 1 if EITHER theme has any failure.
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
  '/home-office-setup-guide.html',
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
  /**
   * `[r, g, b, a]` with channels on 0–255 and alpha on 0–1.
   *
   * Chrome serialises `color-mix()` as `color(srgb r g b / a)` with channels on
   * 0–1, and everything else as `rgb()`/`rgba()` on 0–255. Reading the srgb
   * form as 0–255 crushed every mixed colour to near-black, which silently
   * passed any mixed text sitting on a light surface and failed it on a dark
   * one — so the audit has to know which scale it is looking at.
   */
  const parse = (c) => {
    const n = (c.match(/[\d.]+(?:e[-+]?\d+)?/gi) || []).map(Number);
    const scale = /^color\(/i.test(c) ? 255 : 1;
    const [r, g, b] = [n[0] * scale, n[1] * scale, n[2] * scale];
    return [r, g, b, n.length > 3 ? n[3] : 1];
  };
  const lum = ([r, g, b]) => {
    const [lr, lg, lb] = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  };
  /** Source-over composite of a translucent colour onto an opaque one. */
  const over = ([r, g, b, a], [br, bg_, bb]) =>
    [r * a + br * (1 - a), g * a + bg_ * (1 - a), b * a + bb * (1 - a), 1];
  const bgOf = (el) => {
    let e = el;
    while (e) {
      const c = getComputedStyle(e).backgroundColor;
      if (c && c !== 'transparent') {
        const rgba = parse(c);
        if (rgba[3] > 0.85) return rgba;
      }
      e = e.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)');
  };
  const css = ([r, g, b]) => `rgb(${[r, g, b].map((v) => Math.round(v)).join(', ')})`;
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
    const bg = bgOf(el);
    // Translucent ink is only as readable as what shows through it.
    const fg = over(parse(s.color), bg);
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
        fg: css(fg),
        bg: css(bg),
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
  const totals = {};
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await seedTheme(theme)(context);
    for (const { path, failures } of await collectFailures(context, baseUrl)) {
      totals[theme] = (totals[theme] ?? 0) + failures.length;
      console.log(`\n=== ${theme.toUpperCase()} ${path}`);
      failures.forEach((f) => console.log(`  ${formatFailure(f)}`));
    }
    await context.close();
  }
  await browser.close();
  const failed = Object.entries(totals).filter(([, n]) => n > 0);
  if (failed.length) {
    console.log(`\n${failed.map(([t, n]) => `${n} ${t.toUpperCase()}-theme`).join(', ')} AA failure(s).`);
    process.exit(1);
  }
}
