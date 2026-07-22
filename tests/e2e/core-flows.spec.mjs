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
  await expect(nav.getByRole('link', { name: /Deals|Verified picks/i })).toHaveAttribute('href', '/deals');
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
  const nav = page.getByRole('navigation', { name: 'Primary navigation' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: /Deals|Verified picks/i })).toHaveAttribute('href', '/deals');
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

test('deals expose visible picks, an affiliate disclosure, and tagged Amazon links', async ({ page }) => {
  await page.goto('/deals');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const cards = page.locator('#dealGrid .deal-card');
  expect(await cards.count()).toBeGreaterThan(0);
  await expect(cards.first()).toBeVisible();

  const disclosure = page.locator('.deals-disclosure');
  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText(/affiliate links/i);
  await expect(disclosure.getByRole('link', { name: /disclosure/i })).toHaveAttribute('href', '/affiliate-disclosure');

  const amazonLinks = page.locator('#dealGrid a[href*="amazon.com"]');
  const hrefs = await amazonLinks.evaluateAll((links) => links.map((link) => link.href));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(new URL(href).searchParams.get('tag'), href).toBe('workspacepro-20');
  }
});

test('comparison shoppers can discover the deals route', async ({ page }) => {
  await page.goto('/compare/');
  await expect(page.locator('main').getByRole('link', { name: /deals|value picks/i })).toHaveAttribute('href', '/deals');
});

test('homepage commercial picks are visible, disclosed, sponsored, and tagged', async ({ page }) => {
  await page.goto('/');

  const section = page.locator('.commercial-section');
  await expect(section).toBeVisible();
  await expect(section.locator('.commercial-disclosure')).toContainText(/affiliate links/i);
  await expect(section.getByRole('link', { name: /Browse all .* value picks/i })).toHaveAttribute('href', '/deals');

  const cards = section.locator('.commercial-card');
  await expect(cards).toHaveCount(4);
  const links = cards.locator('a[href*="amazon.com"]');
  await expect(links).toHaveCount(4);
  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    expect(new URL(href).searchParams.get('tag'), href).toBe('workspacepro-20');
    await expect(link).toHaveAttribute('rel', /\bsponsored\b/);
    await expect(link).toBeVisible();
  }
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

test('guide comparison tables stay contained on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile overflow contract');
  await page.goto('/guides/small-home-office-organization-hacks');
  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    tableOverflow: getComputedStyle(document.querySelector('.table-wrap')).overflowX,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  expect(widths.tableOverflow).toBe('auto');
});

test('office builder moves keyboard focus as steps change', async ({ page }) => {
  await page.goto('/build-your-office');
  await page.getByRole('button', { name: /Next/ }).click();
  const question = page.getByText('How do you work?', { exact: true });
  await expect(question).toBeVisible();
  await expect(question).toBeFocused();
  const general = page.locator('.byo-step.active [data-value="general"]');
  await general.focus();
  await page.keyboard.press('Enter');
  await expect(general).toHaveAttribute('aria-checked', 'true');
  await page.locator('.byo-step.active #byoNext1').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('How much space do you have?', { exact: true })).toBeFocused();
});
