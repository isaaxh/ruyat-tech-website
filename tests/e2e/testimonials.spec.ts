// Testimonial carousel: arrows, dots, keys (mirrored in Arabic), swipe, autoplay with pause.
import { test, expect, type Page } from '@playwright/test';
import { prepare } from './helpers';

const front = (page: Page) => page.locator('.tq-card.is-front');
const frontIndex = (page: Page) => page.$$eval('.tq-card', (c) => c.findIndex((x) => x.classList.contains('is-front')));

test('arrows and dots change the front card', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await expect(front(page)).toHaveCount(1);
  expect(await frontIndex(page)).toBe(0);
  await page.locator('.tq-next').click();
  expect(await frontIndex(page)).toBe(1);
  await expect(page.locator('.tq-dot').nth(1)).toHaveClass(/is-on/);
  await page.locator('.tq-prev').click();
  await page.locator('.tq-prev').click();
  expect(await frontIndex(page)).toBe(2); // loops
  await page.locator('.tq-dot').nth(0).click();
  expect(await frontIndex(page)).toBe(0);
  // Only the front card is exposed to assistive tech.
  expect(await page.$$eval('.tq-card[aria-hidden="false"]', (c) => c.length)).toBe(1);
  // No slide counter.
  await expect(page.locator('.tq')).not.toContainText('/ 03');
});

test('arrow keys: right = next in English, left = next in Arabic', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.locator('.tq').focus();
  await page.keyboard.press('ArrowRight');
  expect(await frontIndex(page)).toBe(1);
  await page.keyboard.press('ArrowLeft');
  expect(await frontIndex(page)).toBe(0);

  await page.goto('/ar/');
  await page.locator('.tq').focus();
  await page.keyboard.press('ArrowLeft');
  expect(await frontIndex(page)).toBe(1);
  await page.keyboard.press('ArrowRight');
  expect(await frontIndex(page)).toBe(0);
});

async function swipe(page: Page, dx: number): Promise<void> {
  await page.locator('.tq').evaluate((el, d) => {
    const mk = (type: string, x: number) => {
      const t = new Touch({ identifier: 1, target: el, clientX: x, clientY: 300 });
      el.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [t], changedTouches: [t], bubbles: true }));
    };
    mk('touchstart', 200);
    mk('touchend', 200 + d);
  }, dx);
}

test('swipe left = next in English, swipe right = next in Arabic', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await prepare(page);
  await page.goto('/');
  await swipe(page, -80);
  expect(await frontIndex(page)).toBe(1);
  await swipe(page, 80);
  expect(await frontIndex(page)).toBe(0);
  await swipe(page, 20); // too short: ignored
  expect(await frontIndex(page)).toBe(0);
  await page.goto('/ar/');
  await swipe(page, 80);
  expect(await frontIndex(page)).toBe(1);
  await ctx.close();
});

test('autoplays every 6s and pauses on hover', async ({ page }) => {
  await prepare(page);
  await page.clock.install();
  await page.goto('/');
  await page.mouse.move(5, 5);
  await page.clock.runFor(6600);
  expect(await frontIndex(page)).toBe(1);
  await page.clock.runFor(6600);
  expect(await frontIndex(page)).toBe(2);
  await page.clock.runFor(6600);
  expect(await frontIndex(page)).toBe(0); // loops
  await page.locator('.tq-stage').hover();
  await page.clock.runFor(13000);
  expect(await frontIndex(page)).toBe(0);
});

test('no autoplay under reduced motion', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await prepare(page);
  await page.clock.install();
  await page.goto('/');
  await page.clock.runFor(20000);
  expect(await frontIndex(page)).toBe(0);
  await ctx.close();
});
