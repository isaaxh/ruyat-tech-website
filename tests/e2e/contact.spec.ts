// Contact form: validation, focus management, service preselect, WhatsApp hand-off, honeypot.
import { test, expect, type Page } from '@playwright/test';
import { prepare } from './helpers';

/** Record window.open calls instead of opening WhatsApp. */
async function stubOpen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __opened: unknown[] }).__opened = [];
    window.open = ((...args: unknown[]) => {
      (window as unknown as { __opened: unknown[] }).__opened.push(args);
      return null;
    }) as typeof window.open;
  });
}
const opened = (page: Page) => page.evaluate(() => (window as unknown as { __opened: string[][] }).__opened);

test('empty submit shows errors and focuses the first invalid field', async ({ page }) => {
  await prepare(page);
  await stubOpen(page);
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  for (const k of ['name', 'email', 'service', 'details']) {
    await expect(page.locator(`#f-${k}-err`)).toBeVisible();
    await expect(page.locator(`#f-${k}`)).toHaveAttribute('aria-invalid', 'true');
  }
  await expect(page.locator('#f-name')).toBeFocused();
  await expect(page.locator('#f-name-err')).toHaveText('Please enter your name.');
  // Typing clears that field's error only.
  await page.locator('#f-name').fill('Sara');
  await expect(page.locator('#f-name-err')).toBeHidden();
  await expect(page.locator('#f-email-err')).toBeVisible();
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await expect(page.locator('#f-email')).toBeFocused();
  expect(await opened(page)).toEqual([]);
});

test('invalid email is rejected', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  await page.locator('#f-name').fill('Sara');
  await page.locator('#f-email').fill('sara@example');
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await expect(page.locator('#f-email-err')).toHaveText("That email doesn't look right. Check it and try again.");
});

test('service card link preselects the service', async ({ page }) => {
  await prepare(page);
  await page.goto('/en/');
  await page.getByRole('link', { name: 'Talk to us about automation' }).click();
  await expect(page.locator('#f-service')).toHaveValue('Automation');
  await expect(page).toHaveURL(/#contact$/);
});

test('valid submit opens WhatsApp with an English message and shows the success panel', async ({ page }) => {
  await prepare(page);
  await stubOpen(page);
  await page.goto('/en/');
  await page.locator('#f-name').fill('Sara Alharbi');
  await page.locator('#f-email').fill('sara@example.com');
  await page.locator('#f-service').selectOption('Web app');
  await page.locator('#f-details').fill('A booking system\nfor our clinic & spa');
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();

  const calls = await opened(page);
  expect(calls).toHaveLength(1);
  const [url, target, features] = calls[0];
  expect(target).toBe('_blank');
  expect(features).toBe('noopener');
  expect(url.startsWith('https://wa.me/966583579979?text=')).toBe(true);
  const text = decodeURIComponent(url.split('?text=')[1]);
  expect(text).toBe(
    [
      'New project enquiry from tech.ruyat.sa',
      '',
      'Name: Sara Alharbi',
      'Email: sara@example.com',
      'Service: Web app',
      'Project details: A booking system\nfor our clinic & spa',
    ].join('\n'),
  );

  const success = page.locator('.success');
  await expect(success).toBeVisible();
  await expect(page.locator('form.form')).toBeHidden();
  await expect(success.locator('h3')).toHaveText('Thanks, Sara. Your message is ready.');
  await expect(success.getByRole('link', { name: 'Open WhatsApp again' })).toHaveAttribute('href', url);
  // The old "That didn't send" error state is gone.
  await expect(page.locator('.form-alert')).toHaveCount(0);
});

test('arabic message uses arabic labels and keeps the visitor text', async ({ page }) => {
  await prepare(page);
  await stubOpen(page);
  await page.goto('/');
  await page.locator('#f-name').fill('سارة الحربي');
  await page.locator('#f-email').fill('sara@example.com');
  await page.locator('#f-phone').fill('+966 50 000 0000');
  await page.locator('#f-business').fill('Clinic Co');
  await page.locator('#f-service').selectOption('موقع إلكتروني');
  await page.locator('#f-details').fill('موقع للعيادة');
  await page.getByRole('button', { name: 'أرسل عبر واتساب' }).click();
  const [[url]] = await opened(page);
  expect(decodeURIComponent(url.split('?text=')[1])).toBe(
    [
      'طلب مشروع جديد من tech.ruyat.sa',
      '',
      'الاسم: سارة الحربي',
      'البريد الإلكتروني: sara@example.com',
      'الهاتف: +966 50 000 0000',
      'النشاط التجاري: Clinic Co',
      'الخدمة: موقع إلكتروني',
      'تفاصيل المشروع: موقع للعيادة',
    ].join('\n'),
  );
  await expect(page.locator('.success h3')).toHaveText('شكرًا يا سارة، رسالتك جاهزة.');
});

test('filled honeypot skips the WhatsApp redirect', async ({ page }) => {
  await prepare(page);
  await stubOpen(page);
  await page.goto('/en/');
  await page.locator('#f-name').fill('Bot');
  await page.locator('#f-email').fill('bot@example.com');
  await page.locator('#f-service').selectOption('Website');
  await page.locator('#f-details').fill('spam');
  await page.locator('#f-website').evaluate((el: HTMLInputElement) => (el.value = 'http://spam'));
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  expect(await opened(page)).toEqual([]);
});

test('on mobile the page navigates to WhatsApp', async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  });
  const page = await ctx.newPage();
  await prepare(page);
  let requested = '';
  await page.route('https://wa.me/**', (r) => {
    requested = r.request().url();
    return r.fulfill({ status: 200, body: 'wa' });
  });
  await page.goto('/en/');
  await page.locator('#f-name').fill('Sara');
  await page.locator('#f-email').fill('sara@example.com');
  await page.locator('#f-service').selectOption('Mobile app');
  await page.locator('#f-details').fill('An app');
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  await expect.poll(() => requested).toContain('https://wa.me/966583579979?text=');
  await ctx.close();
});
