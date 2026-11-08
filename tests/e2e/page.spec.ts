// Document-level checks: lang/dir, SEO meta, console errors, links, images, horizontal overflow.
import { test, expect } from '@playwright/test';
import { PAGES, prepare } from './helpers';

for (const p of PAGES) {
  test.describe(`${p.lang} page`, () => {
    test('has correct lang, dir and SEO meta', async ({ page }) => {
      await prepare(page);
      await page.goto(p.path);
      await expect(page.locator('html')).toHaveAttribute('lang', p.lang);
      await expect(page.locator('html')).toHaveAttribute('dir', p.dir);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://tech.ruyat.sa${p.path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://tech.ruyat.sa/en/');
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute('href', 'https://tech.ruyat.sa/');
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', 'https://tech.ruyat.sa/');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      for (const prop of ['og:title', 'og:description', 'og:url', 'og:locale']) {
        await expect(page.locator(`meta[property="${prop}"]`)).toHaveCount(1);
      }
      await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
    });

    test('loads without console errors', async ({ page }) => {
      const errors = await prepare(page);
      await page.goto(p.path, { waitUntil: 'networkidle' });
      await page.mouse.move(400, 300);
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(800);
      expect(errors).toEqual([]);
    });

    test('language link points to the other page', async ({ page }) => {
      await prepare(page);
      await page.goto(p.path);
      const other = p.lang === 'en' ? '/' : '/en/';
      const links = page.locator('a.lang');
      await expect(links).toHaveCount(2);
      for (const href of await links.evaluateAll((a) => a.map((x) => x.getAttribute('href')))) expect(href).toBe(other);
      await page.locator('.nav-end a.lang').click();
      expect(new URL(page.url()).pathname).toBe(other);
    });

    test('every in-page anchor has a target', async ({ page }) => {
      await prepare(page);
      await page.goto(p.path);
      const hrefs = await page.$$eval('a[href^="#"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')!))]);
      const placeholders = hrefs.filter((h) => h === '#');
      const missing = [];
      for (const h of hrefs.filter((x) => x !== '#')) {
        if ((await page.locator(h).count()) !== 1) missing.push(h);
      }
      expect(missing).toEqual([]);
      // Privacy and terms are placeholders until the client provides URLs.
      expect(placeholders).toEqual(['#']);
    });

    test('external links open safely in a new tab', async ({ page }) => {
      await prepare(page);
      await page.goto(p.path);
      const ext = page.locator('a[href^="http"]');
      // 2 case studies, 3 social profiles, map links (details list and footer), floating WhatsApp button
      expect(await ext.count()).toBe(10);
      for (const a of await ext.all()) {
        await expect(a).toHaveAttribute('target', '_blank');
        await expect(a).toHaveAttribute('rel', /noopener/);
      }
    });

    test('images have alt text and dimensions', async ({ page }) => {
      await prepare(page);
      await page.goto(p.path);
      const bad = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => i.getAttribute('alt') === null || !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.src),
      );
      expect(bad).toEqual([]);
      // Below-the-fold images are lazy.
      const eager = await page.$$eval('img', (imgs) => imgs.filter((i) => i.loading !== 'lazy').length);
      expect(eager).toBe(0);
    });

    for (const width of [320, 390, 520, 640, 768, 860, 980, 1100, 1440]) {
      test(`no horizontal scroll at ${width}px`, async ({ page }) => {
        await prepare(page);
        await page.setViewportSize({ width, height: 800 });
        await page.goto(p.path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}

test('contact: form comes before the details list below 1100px', async ({ page }) => {
  await prepare(page);
  for (const [width, formFirst] of [
    [1440, false],
    [1100, true],
    [390, true],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/en/');
    const formTop = await page.locator('.form-panel').evaluate((e) => e.getBoundingClientRect().top);
    const reachTop = await page.locator('.reach').evaluate((e) => e.getBoundingClientRect().top);
    const introTop = await page.locator('#contact-title').evaluate((e) => e.getBoundingClientRect().top);
    if (formFirst) {
      // Stacked: intro on top, then the form, then the details list.
      expect(introTop).toBeLessThan(formTop);
      expect(formTop).toBeLessThan(reachTop);
    } else {
      // Side by side: the form sits to the right of the intro.
      const formLeft = await page.locator('.form-panel').evaluate((e) => e.getBoundingClientRect().left);
      expect(formLeft).toBeGreaterThan(700);
    }
  }
});

test('footer and details list carry the real social and contact links', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  const hrefs = async (sel: string) => page.locator(sel).evaluateAll((a) => a.map((x) => x.getAttribute('href')));
  expect(await hrefs('.foot-col:last-child a')).toEqual([
    'https://www.instagram.com/ruyat.sa/',
    'https://www.tiktok.com/@ruyat.sa',
    'https://www.snapchat.com/add/ruyat.sa',
  ]);
  await expect(page.locator('.foot-col.social a svg')).toHaveCount(3);
  for (const scope of ['.foot-col.wide', '.reach']) {
    const links = await hrefs(`${scope} a`);
    expect(links).toContain('mailto:info@ruyat.sa');
    expect(links).toContain('tel:+966583579979');
    expect(links).toContain('https://www.google.com/maps/dir/?api=1&destination=21.383771,39.785028');
  }
});

test('share preview image is set for both languages', async ({ page, request }) => {
  for (const path of ['/', '/en/']) {
    await page.goto(path);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://tech.ruyat.sa/og-image.png');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  }
  expect((await request.get('/og-image.png')).status()).toBe(200);
});
