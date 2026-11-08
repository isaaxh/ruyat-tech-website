// Full-page screenshots for comparing against reference/*.png.
// Usage: node tools/shot.mjs <baseUrl> <outDir> [--fonts] [--widths=1440,390] [--paths=/en/,/]
// By default Google Fonts are blocked, matching how the reference screenshots were rendered.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [base = 'http://127.0.0.1:4321', out = 'shots', ...flags] = process.argv.slice(2);
const opt = (k, d) => (flags.find((f) => f.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const widths = opt('widths', '1440,390').split(',').map(Number);
const paths = opt('paths', '/en/,/').split(',');
const blockFonts = !flags.includes('--fonts');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const w of widths) {
  for (const p of paths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w > 600 ? 900 : 844 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    if (blockFonts) await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !/fonts\.g/.test(m.text()) && errors.push(m.text()));
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // Load lazy images eagerly and wait for them, so full-page shots show every screenshot.
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
    await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
    await page.waitForTimeout(1500);
    const name = `${p === '/' ? 'ar' : 'en'}-${w}`;
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    console.log(`${name}: height ${h}, scrollWidth ${sw}${errors.length ? `, ERRORS: ${errors.join(' | ')}` : ''}`);
    await ctx.close();
  }
}
await browser.close();
