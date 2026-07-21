import { expect, test } from '@playwright/test';

test('home assessment completes without runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/workspace|body/i);
  await expect(page.locator('#assessment-card')).toBeVisible();
  await expect(page.locator('.assessment-step.active .choice-card').first()).toBeVisible();
  const choose = async (question, value) => page.locator(`.assessment-step.active [data-question="${question}"][data-value="${value}"]`).click();
  const next = async () => page.locator('[data-next]:visible').click();
  await choose('workType', 'general');
  await next();
  await choose('hours', '6-8');
  await choose('pain', 'none');
  await next();
  await choose('standing', 'sometimes');
  await choose('space', 'medium');
  await next();
  await choose('budget', '500-1000');
  await choose('workTime', 'day');
  await next();
  await choose('priority', 'health');
  await next();
  await page.locator('#assessmentHeight').fill('69');
  await next();
  await expect(page.getByRole('heading', { name: 'My Workspace Blueprint', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share blueprint' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore practical guides' })).toHaveAttribute('href', '/guides');
  expect(errors).toEqual([]);
});
test('desktop navigation remains visible and interactive', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop navigation contract');
  await page.goto('/guides');
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav).toBeVisible();
  await expect(nav).not.toHaveAttribute('aria-hidden', 'true');
  expect(await nav.evaluate((element) => element.inert)).toBe(false);
  await nav.getByRole('link', { name: 'Tools' }).click();
  await expect(page).toHaveURL(/\/tools(?:\.html)?$/);
});


test('mobile menu exposes navigation and restores state', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile navigation contract');
  await page.goto('/guides');
  const menu = page.getByRole('button', { name: 'Menu' });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});

test('guide research and disclosure contract is visible', async ({ page }) => {
  await page.goto('/guides/standing-desks-for-short-users');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Standing Desks for Short Users');
  await expect(page.getByText('How this guide was prepared')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
  await expect(page.getByText(/affiliate links/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Keep working on your setup' })).toBeVisible();
});

test('printable worksheet accepts measurements', async ({ page }) => {
  await page.goto('/desk-fit-worksheet');
  await expect(page.getByRole('heading', { name: 'My desk-fit check' })).toBeVisible();
  const height = page.getByLabel('My height');
  await height.fill('69 in');
  await expect(height).toHaveValue('69 in');
  await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeVisible();
  const feet = page.getByRole('group', { name: /Feet/ });
  await expect(feet.getByRole('radio', { name: 'Works' })).toBeVisible();
});
