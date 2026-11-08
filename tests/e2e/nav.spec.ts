// Nav: compacts into a gold dot on scroll down, unpacks on scroll up, dot expands it; burger menu on mobile.
import { test, expect } from '@playwright/test';
import { prepare } from './helpers';

async function scrollBy(page: import('@playwright/test').Page, dy: number, steps = 8): Promise<void> {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, dy / steps);
    await page.waitForTimeout(30);
  }
}

test('compacts on scroll down and unpacks on scroll up', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  await page.mouse.move(700, 400);
  const nav = page.locator('header.nav');
  await scrollBy(page, 900);
  await expect(nav).toHaveClass(/is-compact/);
  await expect(page.locator('.nav-dot')).toHaveAttribute('tabindex', '0');
  await scrollBy(page, -200);
  await expect(nav).toHaveClass(/is-unpacked/);
  await expect(nav).not.toHaveClass(/is-compact/);
  await expect(page.locator('.nav-dot')).toHaveAttribute('tabindex', '-1');
});

test('clicking the gold dot expands the nav', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  await page.mouse.move(700, 400);
  await scrollBy(page, 900);
  const nav = page.locator('header.nav');
  await expect(nav).toHaveClass(/is-compact/);
  await page.waitForTimeout(700); // let the dot finish appearing
  await page.locator('.nav-dot').click();
  await expect(nav).toHaveClass(/is-unpacked/);
});

test('stays expanded near the top of the page', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  await page.mouse.move(700, 400);
  await scrollBy(page, 100);
  await page.waitForTimeout(400);
  await expect(page.locator('header.nav')).not.toHaveClass(/is-compact/);
});

test('burger menu opens, animates to a cross and closes on link click (mobile)', async ({ page }) => {
  await prepare(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  const btn = page.locator('.menu-btn');
  const panel = page.locator('.menu-panel');
  await expect(page.locator('.nav-links')).toBeHidden();
  await expect(btn).toBeVisible();
  await expect(panel).toBeHidden();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(btn).toHaveAttribute('aria-label', 'Close menu');
  await expect(panel).toBeVisible();
  await panel.getByRole('link', { name: 'Work' }).click();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(btn).toHaveAttribute('aria-label', 'Open menu');
  await expect(panel).toBeHidden();
  await expect(page).toHaveURL(/#work$/);
});

test('arabic menu labels are translated', async ({ page }) => {
  await prepare(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const btn = page.locator('.menu-btn');
  await expect(btn).toHaveAttribute('aria-label', 'فتح القائمة');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-label', 'إغلاق القائمة');
});

test('start-a-project button hides at 520px and below', async ({ page }) => {
  await prepare(page);
  await page.setViewportSize({ width: 520, height: 800 });
  await page.goto('/en/');
  await expect(page.locator('.nav-cta')).toBeHidden();
  await page.setViewportSize({ width: 600, height: 800 });
  await expect(page.locator('.nav-cta')).toBeVisible();
});
