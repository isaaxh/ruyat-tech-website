// Reduced motion, focus styles and canvas effects.
import { test, expect } from '@playwright/test';
import { prepare } from './helpers';

test('reduced motion: effects off, marquee static and wrapped', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await prepare(page);
  await page.goto('/en/');
  expect(await page.$$eval('canvas.hexfx', (c) => c.every((x) => getComputedStyle(x).display === 'none'))).toBe(true);
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.marquee-track')).toHaveCSS('flex-wrap', 'wrap');
  await expect(page.locator('.marquee-track li[aria-hidden]').first()).toBeHidden();
  await expect(page.locator('.hero-title')).toHaveCSS('animation-name', 'none');
  await ctx.close();
});

test('marquee pauses on hover', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  await page.locator('.marquee').hover();
  await expect(page.locator('.marquee-track')).toHaveCSS('animation-play-state', 'paused');
});

test('keyboard: skip link first, then nav; focus ring is 2px gold', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
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
  await page.goto('/en/');
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
  await page.goto('/en/');
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
  await page.goto('/en/');
  const card = page.locator('.svc-card').first();
  await card.scrollIntoViewIfNeeded();
  const before = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(500);
  const after = await card.boundingBox();
  expect(after!.y).toBeCloseTo(before!.y, 0);
  await expect(card).toHaveCSS('transform', 'none');
});

for (const [path, label] of [
  ['/en/', 'Start a project'],
  ['/', 'ابدأ مشروعك'],
] as const) {
  test(`process: closing call to action is a button that goes to the form (${path})`, async ({ page }) => {
    await prepare(page);
    await page.goto(path);
    const cta = page.locator('.proc-close a.rt-btn');
    await expect(cta).toHaveText(label);
    await expect(cta).toHaveAttribute('href', '#contact');
    await cta.scrollIntoViewIfNeeded();
    await cta.click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact')).toBeInViewport();
  });
}

for (const [path, number] of [['/en/', '966583579979'], ['/', '966583579979']] as const) {
  test(`floating WhatsApp button links to the chat and stays on screen (${path})`, async ({ page }) => {
    await prepare(page);
    await page.goto(path);
    const fab = page.locator('a.wa-fab');
    await expect(fab).toHaveAttribute('href', `https://wa.me/${number}`);
    await expect(fab).toHaveAttribute('target', '_blank');
    await expect(fab).toHaveAttribute('rel', /noopener/);
    await expect(fab).toHaveAttribute('aria-label', /.+/);
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(300);
    await expect(fab).toBeInViewport({ ratio: 1 });
    // Always on the right edge, in both languages.
    const box = (await fab.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(vw - (box.x + box.width)).toBeLessThanOrEqual(24);
    expect(box.x).toBeGreaterThan(vw / 2);
  });
}

test('privacy and terms placeholders are clickable but do nothing', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  const link = page.locator('a[data-placeholder]').first();
  await link.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  await link.click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await expect(page).toHaveURL(/\/$/);
});

for (const path of ['/en/', '/']) {
  test(`"Powered by" badges use a pulsing gold dot, not the logo (${path})`, async ({ page }) => {
    await prepare(page);
    await page.goto(path);
    const badges = page.locator('.badge');
    expect(await badges.count()).toBe(2);
    for (const b of await badges.all()) {
      await expect(b.locator('svg')).toHaveCount(0);
      const dot = b.locator('.badge-dot');
      await expect(dot).toHaveCount(1);
      expect(await dot.evaluate((e) => getComputedStyle(e).animationName)).toBe('rt-badge-pulse');
    }
  });
}

test('section hexagon grids light up softly around the pointer and fade after it leaves', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  const canvas = page.locator('footer canvas.hexfx').first();
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = (await canvas.boundingBox())!;
  const x = box.x + 90;
  const y = box.y + box.height - 90;
  // Count lit pixels in a window around the pointer, then compare with the pointer held there.
  const lit = () =>
    canvas.evaluate(
      (c: HTMLCanvasElement, [px, py]) => {
        const r = c.getBoundingClientRect();
        const s = c.width / r.width;
        const w = 140 * s;
        const d = c.getContext('2d')!.getImageData(Math.max(0, (px - r.left) * s - w / 2), Math.max(0, (py - r.top) * s - w / 2), w, w).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++;
        return n;
      },
      [x, y],
    );
  // Random tile flashes also draw here, so compare the quietest of several samples.
  const quietest = async (move: boolean) => {
    let min = Infinity;
    for (let i = 0; i < 10; i++) {
      if (move) await page.mouse.move(x + (i % 3), y + (i % 3));
      await page.waitForTimeout(120);
      min = Math.min(min, await lit());
    }
    return min;
  };
  await page.mouse.move(2, 2);
  await page.waitForTimeout(2500);
  const idle = await quietest(false);
  const hover = await quietest(true);
  expect(hover).toBeGreaterThan(idle + 100);
  await page.mouse.move(2, 2);
  await page.waitForTimeout(2500);
  expect(await quietest(false)).toBeLessThan(hover - 100);
});

test('floating WhatsApp icon stays dark and readable on hover', async ({ page }) => {
  await prepare(page);
  await page.goto('/');
  const fab = page.locator('a.wa-fab');
  const color = () => fab.evaluate((e) => getComputedStyle(e).color);
  const before = await color();
  await fab.hover();
  await page.waitForTimeout(500);
  expect(await color()).toBe(before);
  expect(before).toBe('rgb(3, 10, 31)');
});
