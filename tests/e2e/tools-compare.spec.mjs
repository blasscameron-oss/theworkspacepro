import { expect, test } from '@playwright/test';

test('tools page exposes current tool inventory without horizontal overflow', async ({ page }) => {
  await page.goto('/tools');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Measure first');
  await expect(page.getByRole('link', { name: /Workspace blueprint/i })).toHaveAttribute('href', '/#assessment');
  await expect(page.getByRole('link', { name: /Compare workspace products/i })).toHaveAttribute('href', '/compare/');
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

test('comparison filters render products and preserve shareable state', async ({ page }) => {
  await page.goto('/compare/?category=chair&budget=under-350');
  await expect(page.locator('#matrixGrid .matrix-card').first()).toBeVisible();
  await expect(page.locator('#filterCategory')).toHaveValue('chair');
  await expect(page.locator('#filterBudget')).toHaveValue('under-350');
  await page.locator('#filterSearch').fill('HON');
  await expect(page).toHaveURL(/q=HON/);
  await expect(page.locator('#matrixGrid .matrix-card')).toHaveCount(1);
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});
