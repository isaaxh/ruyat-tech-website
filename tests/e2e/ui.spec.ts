// Cookie banner, reduced motion, focus styles and canvas effects.
import { test, expect } from '@playwright/test';
import { prepare } from './helpers';

test('cookie banner shows once and remembers the choice', async ({ page }) => {
  await prepare(page, { cookieChoice: false });
  await page.goto('/');
  const banner = page.locator('.cookie');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Accept' }).click();
  await expect(banner).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('rt-cookie-choice'))).toBe('accepted');
  await page.reload();
  await expect(banner).toBeHidden();
});

test('cookie banner still works when storage throws', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  const errors = await prepare(page, { cookieChoice: false });
  await page.goto('/');
  const banner = page.locator('.cookie');
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Decline' }).click();
  await expect(banner).toBeHidden();
  expect(errors).toEqual([]);
});

test('arabic cookie banner sits on the right', async ({ page }) => {
  await prepare(page, { cookieChoice: false });
  await page.goto('/ar/');
  const box = await page.locator('.cookie').boundingBox();
  expect(box!.x + box!.width).toBeGreaterThan(1400);
});

test('reduced motion: effects off, marquee static and wrapped', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await prepare(page);
  await page.goto('/');
  expect(await page.$$eval('canvas.hexfx', (c) => c.every((x) => getComputedStyle(x).display === 'none'))).toBe(true);
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.marquee-track')).toHaveCSS('flex-wrap', 'wrap');
  await expect(page.locator('.marquee-track li[aria-hidden]').first()).toBeHidden();
  await expect(page.locator('.hero-title')).toHaveCSS('animation-name', 'none');
  await ctx.close();
});

test('marquee pauses on hover', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.locator('.marquee').hover();
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-play-state', 'paused');
});

test('keyboard: skip link first, then nav; focus ring is 2px gold', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('a.sr')).toBeFocused();
  await page.keyboard.press('Tab');
  const logo = page.locator('.nav .nav-logo');
  await expect(logo).toBeFocused();
  await expect(logo).toHaveCSS('outline-style', 'solid');
  await expect(logo).toHaveCSS('outline-width', '2px');
  await expect(logo).toHaveCSS('outline-color', 'rgb(240, 179, 94)');
});

test('form fields get the soft gold focus state', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  const field = page.locator('#f-name');
  const bgBefore = await field.evaluate((e) => getComputedStyle(e).backgroundColor);
  await field.focus();
  await page.waitForTimeout(450);
  await expect(field).toHaveCSS('border-color', 'rgba(240, 179, 94, 0.45)');
  await expect(field).toHaveCSS('outline-style', 'none');
  expect(await field.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(bgBefore);
});

test('hero lattice and section canvases draw something', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  await page.waitForTimeout(600);
  const painted = await page.locator('canvas.hero-lattice').evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
    return false;
  });
  expect(painted).toBe(true);
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3500);
  const fx = await page.locator('#services canvas.hexfx').first().evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) return true;
    return false;
  });
  expect(fx).toBe(true);
});

test('service cards do not lift on hover (edges only)', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  const card = page.locator('.svc-card').first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(500);
  const after = await card.boundingBox();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  await expect(card).toHaveCSS('transform', 'none');
});
