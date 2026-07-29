import { test, expect } from '@playwright/test';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Nothing may scroll sideways on a phone.
 *
 * The route list is derived from ./dist rather than hand-written. The previous
 * version of this guard pinned a single guide that happened to use a scrolling
 * table wrapper, so it passed while eight other guides pushed the document to
 * 727px at a 375px viewport. A hand-maintained list only proves the routes
 * somebody remembered; this one cannot go stale.
 */
const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
};

const routes = (await walk('dist'))
  .map((file) => file.replace(/^dist/, '').replace(/\/index\.html$/, '/'))
  .sort();

test.describe('mobile horizontal overflow', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile overflow contract');

  test('no built route scrolls sideways at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    expect(routes.length, 'route list derived from the build must not be empty').toBeGreaterThan(20);

    const offenders = [];
    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.ok(), `${route} must be reachable — an unreachable page is a vacuous pass`).toBe(true);
      const overflow = await page.evaluate(() => {
        const de = document.documentElement;
        if (de.scrollWidth <= de.clientWidth + 1) return null;
        let culprit = '';
        for (const el of document.querySelectorAll('body *')) {
          const rect = el.getBoundingClientRect();
          if (rect.right > de.clientWidth + 1 && rect.width > 40) {
            culprit = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0] || ''}`;
            break;
          }
        }
        return { scrollWidth: de.scrollWidth, viewport: de.clientWidth, culprit };
      });
      if (overflow) offenders.push(`${route} → ${overflow.scrollWidth}px wide (viewport ${overflow.viewport}) via ${overflow.culprit}`);
    }

    expect(offenders, `routes scrolling sideways:\n${offenders.join('\n')}`).toEqual([]);
  });
});
