import { test as base, type Page } from '@playwright/test';

export const PAGES = [
  '/',
  '/uslugi/remont/',
  '/uslugi/potolki/',
  '/uslugi/okna/',
  '/uslugi/santehnika/',
  '/uslugi/elektrika/',
  '/privacy/',
  '/cookies/',
  '/terms/',
  '/data/',
  '/o-proekte/',
];

/** Collects console errors, uncaught exceptions and CSP violations for the whole test. */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(m.text())) errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));
    await use(errors);
  },
});

export { expect } from '@playwright/test';

/** Pretends the visitor already answered the cookie banner, for tests about other things. */
export async function skipBanner(page: Page) {
  await page.addInitScript(() => {
    try {
      if (!localStorage.getItem('otves.consent')) {
        localStorage.setItem('otves.consent', JSON.stringify({ v: 1, analytics: false, at: Date.now() }));
      }
    } catch {
      /* storage blocked */
    }
  });
}

/** A valid 1×1 PNG. */
export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 720;
