import { expect, test } from '@playwright/test';

// Derived from the catalog shortlist: 11 flagged products, of which two desks
// carry a reference price at or under $200 (FLEXISPOT EN1, SHW w/Drawer).
const SHORTLIST_COUNT = 11;
const DESKS_UNDER_200 = 2;

test('Deals query filters, reset, and analytics hooks remain functional', async ({ page }) => {
  await page.goto('/deals?category=desk&budget=under-200');
  await expect(page.locator('#dealCategory')).toHaveValue('desk');
  await expect(page.locator('#dealBudget')).toHaveValue('under-200');
  await expect(page.locator('#dealGrid .deal-card:visible')).toHaveCount(DESKS_UNDER_200);
  await expect(page.locator('#dealCount')).toHaveText(`Showing ${DESKS_UNDER_200} of ${SHORTLIST_COUNT} value picks`);

  await page.locator('#dealReset').click();
  await expect(page.locator('#dealGrid .deal-card:visible')).toHaveCount(SHORTLIST_COUNT);
  await expect(page).toHaveURL(/\/deals$/);
  await expect(page.locator('#dealCategory')).toBeFocused();
});

test('Deals remains contained and readable on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile layout contract');
  await page.goto('/deals');
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.locator('#dealGrid .deal-card').first()).toBeVisible();
  await expect(page.locator('#dealGrid .deal-card').first().locator('.deal-card__cta')).toBeVisible();
});
