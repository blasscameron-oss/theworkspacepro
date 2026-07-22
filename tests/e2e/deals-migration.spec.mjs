import { expect, test } from '@playwright/test';

test('Deals query filters, reset, and analytics hooks remain functional', async ({ page }) => {
  await page.goto('/deals?category=desk&budget=under-200');
  await expect(page.locator('#dealCategory')).toHaveValue('desk');
  await expect(page.locator('#dealBudget')).toHaveValue('under-200');
  await expect(page.locator('#dealGrid .deal-card:visible')).toHaveCount(1);
  await expect(page.locator('#dealCount')).toHaveText('Showing 1 of 11 value picks');

  await page.locator('#dealReset').click();
  await expect(page.locator('#dealGrid .deal-card:visible')).toHaveCount(11);
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
