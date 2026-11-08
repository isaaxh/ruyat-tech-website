import type { Page } from '@playwright/test';

export const PAGES = [
  { path: '/en/', lang: 'en', dir: 'ltr' },
  { path: '/', lang: 'ar', dir: 'rtl' },
] as const;

/** Block Google Fonts (keeps tests offline-safe) and collect page errors and console errors. */
export async function prepare(page: Page, ): Promise<string[]> {
  const errors: string[] = [];
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/ERR_FAILED|fonts\.g/.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  return errors;
}
