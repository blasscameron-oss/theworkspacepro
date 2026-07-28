import { test, expect } from '@playwright/test';
import { PAGES, collectFailures, formatFailure, seedTheme } from '../../scripts/audit-contrast.mjs';

/**
 * Permanent guard against the contrast regressions this site keeps hitting:
 * a later stylesheet repainting a deliberately dark/saturated band with page
 * ink, or a text token drifting too light for the cream surfaces.
 *
 * Only the mobile project runs it — the audit is defined at 375px, and running
 * it twice would just double the page loads for identical results.
 *
 * Dark theme is audited by `node scripts/audit-contrast.mjs` but not asserted
 * here yet; it still has known failures (footer, orange CTAs). Flip the
 * `themes` array below to ['light', 'dark'] once those are cleared.
 */
const themes = ['light'];

test.describe('WCAG AA text contrast', () => {
  test.slow();

  for (const theme of themes) {
    test(`${theme} theme has no AA failures`, async ({ browser, baseURL }) => {
      test.skip(test.info().project.name !== 'mobile-chromium', 'audited once, at 375px');
      const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
      await seedTheme(theme)(context);
      const results = await collectFailures(context, baseURL, PAGES);
      await context.close();

      const report = results
        .map(({ path, failures }) => [path, ...failures.map((f) => `  ${formatFailure(f)}`)].join('\n'))
        .join('\n\n');
      expect(report, `${theme} theme contrast failures:\n${report}`).toBe('');
    });
  }
});
